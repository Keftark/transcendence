import os
import json
import base64
import hashlib
import time
import re
from PIL import Image
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.utils.translation import gettext as _
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import HttpResponse
from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from django.contrib.auth.hashers import check_password
from accounts.models import *
from accounts.serializers import AccountSerializer
from ..serializers import UpdateUserSerializer, UpdatePasswordSerializer, UpdateSettingsSerializer
from rest_framework.generics import UpdateAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from dotenv import load_dotenv
from django.db.models import Q, Case, When, Value



# Load environment variables from .env file
load_dotenv()

# from django.views.decorators.csrf import csrf_exempt

def home(request):
    return render(request, 'index.html', {'current_page': 'home'})

def modes(request):
    return render(request, 'index.html', {'current_page': 'modes'})

def registering(request):
    return render(request, 'index.html', {'current_page': 'registering'})

def sign_in(request):
    return render(request, 'index.html', {'current_page': 'signIn'})

def rules(request):
    return render(request, 'index.html', {'current_page': 'rules'})

def duel(request):
    return render(request, 'index.html', {'current_page': 'duel'})

def game_local(request):
    return render(request, 'index.html', {'current_page': 'game-local'})

def game_online(request):
    return render(request, 'index.html', {'current_page': 'game-online'})

def game_ai(request):
    return render(request, 'index.html', {'current_page': 'game-ai'})

def game_tournament(request):
    return render(request, 'index.html', {'current_page': 'game-tournament'})

def tournament_lobby(request):
    return render(request, 'index.html', {'current_page': 'tournament-lobby'})
    
def index(request):
    return render(request, 'index.html', {})

def get_address(request):
    HOST_ADDRESS = os.getenv('HOST_ADDRESS', 'default_value')
    if not HOST_ADDRESS:
        return JsonResponse({'error': 'HOST_ADDRESS not found in .env'}, status=500)
    return JsonResponse({'HOST_ADDRESS': HOST_ADDRESS})

def register_user(request):
    if request.method == 'POST':
        try:
            # Parse the JSON body
            data = json.loads(request.body)

            # Extract fields
            name = data.get('name', '').strip()
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '').strip()
            status = data.get('status', '').strip()

            # Check required fields
            if not name or not email or not password:
                return JsonResponse({'success': False, 'errors': ['Missing required fields.']}, status=400)

            # Check for existing username or email
            if User.objects.filter(username=name).exists():
                return JsonResponse({'success': False, 'errors': ['User with this name is already registered.']}, status=400)
            if User.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'errors': ['Email is already registered.']}, status=400)

            # Validate password
            try:
                validate_password(password)  # User not needed here
            except ValidationError as e:
                return JsonResponse({'success': False, 'errors': e.messages}, status=400)

            # Create and save the user
            user = User.objects.create_user(
                username=name,
                first_name=first_name,
                last_name=last_name,
                email=email,
                password=password,
            )
            user.accountmodel.status = status
            user.accountmodel.save()
            user.save()

            # Log the user in
            login(request, user)

            # Return success response
            return JsonResponse({'success': True, 'message': 'User registered and logged in successfully.'})

        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'errors': ['Invalid JSON.']}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'errors': [str(e)]}, status=500)

    # Invalid request method
    return JsonResponse({'success': False, 'errors': ['Invalid request method.']}, status=405)
    
def logout_user(request):
    if request.method == 'POST':
        request.user.accountmodel.status = "offline"
        request.user.accountmodel.save()
        logout(request)

        return JsonResponse({'success': True, 'message': 'User logged out successfully.'})

    return JsonResponse({'success': False, 'error': 'Invalid request method.'}, status=405)

def check_user_login(request):
    return JsonResponse({'is_logged_in': request.user.is_authenticated})

def get_logged_in_user(request):
    if request.user.is_authenticated:
        user = request.user
        return JsonResponse({
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'id': user.id,
        })
    else:
        return JsonResponse({'error': 'User is not logged in.'}, status=403)

def get_user_avatar(request, username):
    try:
        # Get the user by username
        user = User.objects.get(username=username)
        
        # Access the related AccountModel instance
        account = user.accountmodel
        
        # Check if the avatar exists
        if account.avatar:
            return JsonResponse({'avatar_url': account.avatar.url})
        else:
            # Handle case where avatar is not uploaded
            return JsonResponse({'avatar_url': None, 'message': 'No avatar available'}, status=200)
    
    except User.DoesNotExist:
        # Handle case where user is not found
        return JsonResponse({'error': 'User not found'}, status=404)

def get_user_avatar_id(request, user_id):
    try:
        # Get the user by username
        user = User.objects.get(id=user_id)
        
        # Access the related AccountModel instance
        account = user.accountmodel
        
        # Check if the avatar exists
        if account.avatar:
            return JsonResponse({'avatar_url': account.avatar.url})
        else:
            # Handle case where avatar is not uploaded
            return JsonResponse({'avatar_url': None, 'message': 'No avatar available'}, status=200)
    
    except User.DoesNotExist:
        # Handle case where user is not found
        return JsonResponse({'error': 'User not found'}, status=404)

@require_http_methods(["GET", "PUT"])  # Allow GET and PUT methods
def get_user_paddle(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    # Handle GET request: return preferred paddle skin
    if request.method == 'GET':
        return JsonResponse({
            'preferredPaddle': user.accountmodel.preferredPaddle
        })

    # Handle PUT request: update preferred paddle skin
    elif request.method == 'PUT':
        try:
            # Get the JSON data sent in the request body
            data = json.loads(request.body)

            # Get the new preferred paddle skin from the request data
            new_paddle_skin = data.get('preferredPaddle')
            if not new_paddle_skin:
                return JsonResponse({'error': 'Preferred paddle skin is required'}, status=400)

            # Update the user's preferred paddle skin
            user.accountmodel.preferredPaddle = new_paddle_skin
            user.accountmodel.save()

            # Return the updated user data
            return JsonResponse({
                'preferredPaddle': user.accountmodel.preferredPaddle
            })

        except KeyError:
            return JsonResponse({'error': 'Invalid data'}, status=400)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

def get_notifications(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        return JsonResponse({
            'notifications': user.notifications
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

def get_user_by_name(request, username):
    try:
        # Query the User model by username
        user = User.objects.get(username=username)
        return JsonResponse({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'status': user.accountmodel.status
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

@require_http_methods(["GET", "PUT"])  # Allow GET and PUT methods
def set_user_status(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    # Handle GET request: return preferred paddle skin
    if request.method == 'GET':
        return JsonResponse({
            'status': user.accountmodel.status
        })

    # Handle PUT request: update preferred paddle skin
    elif request.method == 'PUT':
        try:
            # Get the JSON data sent in the request body
            data = json.loads(request.body)

            # Get the new preferred paddle skin from the request data
            new_status = data.get('status')
            if not new_status:
                return JsonResponse({'error': 'Status is required'}, status=400)

            # Update the user's preferred paddle skin
            user.accountmodel.status = new_status
            user.accountmodel.save()

            # Return the updated user data
            return JsonResponse({
                'status': user.accountmodel.status
            })

        except KeyError:
            return JsonResponse({'error': 'Invalid data'}, status=400)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


def get_user_by_id(request, user_id):
    try:
        # Query the User model by username
        user = User.objects.get(id=user_id)
        return JsonResponse({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

def get_username(request, user_id):
    try:
        # Query the User model by username
        user = User.objects.get(id=user_id)
        return JsonResponse({
            'username': user.username
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

def login_user(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            settings = SettingsModel.objects.get(pk=user.id)
            login(request, user)
            user2 = User.objects.get(username=username)
            user2.accountmodel.status = "online"
            user2.accountmodel.save()
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "preferredPaddle": user.accountmodel.preferredPaddle,
                "status": user.accountmodel.status,
                "color": settings.color,
                "language": settings.language,
                "orthographicView": settings.view
            }
            return JsonResponse({
                "message": "Login successful",
                "user": user_data
            }, status=200)
        else:
            return JsonResponse({"message": "Invalid credentials"}, status=400)

    return JsonResponse({"message": "Invalid request method"}, status=405)

def image_to_base64(image) -> str:
    """Converts image to base64 string"""
    return base64.b64encode(image.read()).decode()
  
def convert_str_to_image(image_data: str):
    """Converts base 64 string to django image"""
    decoded_data = base64.b64decode(image_data.encode())
    myfile = SimpleUploadedFile.from_dict(
    {
        "filename": "logo",
        "content": decoded_data,
        "content-type": "'image/jpeg'",
    }
    )
    return myfile

def upload_base64image(request):
    if request.method == "POST":
        data = request.data
        serializer = AccountSerializer(data=data)

        if serializer.is_valid():
            account = serializer.save()
            data = serializer.data
            return JsonResponse({'success': False, 'message': 'No image uploaded.'})
        return JsonResponse({'success': True, 'url': data})

MAX_FILE_SIZE = 5 * 1024 * 1024

def generate_secure_filename(original_name):
    """Generate a secure name based on the original name.

    Args:
        original_name (stirng): original name.

    Returns:
        string: secured name.
    """
    ext = os.path.splitext(original_name)[1]
    hash_name = hashlib.sha256(f"{time.time()}_{original_name}".encode()).hexdigest()
    return f"{hash_name}{ext}"

def sanitize_filename(filename):
    """Sanitize an input.

    Args:
        filename (string): input to sanitize.

    Returns:
        string: sanitized input.
    """
    return re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)

def validate_image(image):
    """Uses Pillow API to validate an image.

    Args:
        image (Image): image to validate.

    Returns:
        bool: `True` if the image is verified, `False` otherwise.
    """
    try:
        img = Image.open(image)
        img.verify()
        return True
    except Exception:
        return False

def upload_image(request):
    if request.method == 'POST' and request.FILES.get('image'):
        image = (request.FILES['image'])

        if image.size > MAX_FILE_SIZE:
            return JsonResponse({'success': False, 'message': 'File too large.'})
        
        if not validate_image(image):
            return JsonResponse({'success': False, 'message': 'Invalid image file.'})
        
        fs = FileSystemStorage(location=settings.MEDIA_ROOT)
        filename = generate_secure_filename(sanitize_filename(image.name))
        saved_filename = fs.save(filename, image)

        user = request.user
        user.accountmodel.avatar = saved_filename
        user.accountmodel.save()

        return JsonResponse({'success': True, 'url': filename})
    else:
        return JsonResponse({'success': False, 'message': 'No image uploaded.'})

def del_user(request):
    try:
        u = request.user
        u.delete()
        logout(request)
        JsonResponse({'success': True, 'message':'The user is deleted'})         

    except User.DoesNotExist:
        JsonResponse({'success': False, 'message':'The user does not exists'})
        return render(request, 'index.html')

    return render(request, 'index.html') 

def change_user_password(request):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            current_password = data.get("current_password")
            new_password = data.get("new_password")
            confirm_password = data.get("new_password2")
            if not current_password or not new_password or not confirm_password:
                return JsonResponse({"success": False, "errors": ["All fields are required."]}, status=400)
            if new_password != confirm_password:
                return JsonResponse({"success": False, "errors": ["New passwords do not match."]}, status=400)
            if not request.user.is_authenticated:
                return JsonResponse({"success": False, "errors": ["Unauthorized."]}, status=401)
            user = request.user
            if not check_password(current_password, user.password):
                return JsonResponse({"success": False, "errors": ["Current password is incorrect."]}, status=400)
            try:
                validate_password(new_password, user)
            except ValidationError as e:
                return JsonResponse({"success": False, "errors": list(e.messages)}, status=400)
            user.set_password(new_password)
            user.save()
            return JsonResponse({"success": True, "message": "Password updated successfully!"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "errors": ["Invalid JSON data."]}, status=400)

    return JsonResponse({"success": False, "errors": ["Invalid request method."]}, status=405)

def change_username(request):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            new_username = data.get("new_username")
            if not request.user.is_authenticated:
                return JsonResponse({"success": False, "errors": ["Unauthorized."]}, status=401)
            if User.objects.filter(username=new_username).exists():
                return JsonResponse({"success": False, "errors": ["Username is already taken."]}, status=400)
            request.user.username = new_username
            request.user.save()
            return JsonResponse({"success": True, "message": "Username updated successfully!"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "errors": ["Invalid JSON data."]}, status=400)

    return JsonResponse({"success": False, "errors": ["Invalid request method."]}, status=405)

def change_firstname(request):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            new_firstname = data.get("new_firstname")
            if not request.user.is_authenticated:
                return JsonResponse({"success": False, "errors": ["Unauthorized."]}, status=401)
            request.user.first_name = new_firstname
            request.user.save()
            return JsonResponse({"success": True, "message": "First name updated successfully!"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "errors": ["Invalid JSON data."]}, status=400)

    return JsonResponse({"success": False, "errors": ["Invalid request method."]}, status=405)

def change_lastname(request):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            new_lastname = data.get("new_lastname")
            if not request.user.is_authenticated:
                return JsonResponse({"success": False, "errors": ["Unauthorized."]}, status=401)
            request.user.last_name = new_lastname
            request.user.save()
            return JsonResponse({"success": True, "message": "Last name updated successfully!"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "errors": ["Invalid JSON data."]}, status=400)

    return JsonResponse({"success": False, "errors": ["Invalid request method."]}, status=405)

def get_all_statuses(request):
    if request.method == 'GET':
        try:
            statuses = list(
                AccountModel.objects.filter(Q(status__in=["online", "busy", "offline"]))
                .annotate(
                    sort_order=Case(
                        When(status="online", then=Value(1)),
                        When(status="busy", then=Value(2)),
                        When(status="offline", then=Value(3)),
                        default=Value(4),
                    )
                )
                .order_by('sort_order')
                .values('user__username', 'status')
            )
            return JsonResponse({"success": True, 'statuses': statuses}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "errors": ["Invalid JSON data."]}, status=400)

    return JsonResponse({"success": False, "errors": ["Invalid request method."]}, status=405)

class UpdateProfileView(UpdateAPIView):

    queryset = User.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = UpdateUserSerializer

    def get_object(self):
        return self.queryset.get(pk=self.request.user.pk)
    
class UpdatePasswordView(UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = UpdatePasswordSerializer

    def get_object(self):
        return self.queryset.get(pk=self.request.user.pk)
    
class UpdateSettingsView(UpdateAPIView):
    queryset = SettingsModel.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = UpdateSettingsSerializer

    def get_object(self):
        return self.queryset.get(pk=self.request.user.pk)