from django.shortcuts import render
import os
from django.http import HttpResponse
from django.contrib.auth.models import User
import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.utils.translation import gettext as _
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from accounts.models import *
from ..serializers import UpdateUserSerializer, UpdatePasswordSerializer, UpdateSettingsSerializer
from rest_framework.generics import UpdateAPIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from accounts.serializers import AccountSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.decorators import login_required
from dotenv import load_dotenv
from django.core.files.storage import FileSystemStorage
from django.conf import settings
import base64
from django.views.decorators.http import require_http_methods

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

def tournament_menu(request):
    return render(request, 'index.html', {'current_page': 'tournament-menu'})

def tournament_lobby(request):
    return render(request, 'index.html', {'current_page': 'tournament-lobby'})

def tournament_join(request):
    return render(request, 'index.html', {'current_page': 'tournament-join'})

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
            'last_name': user.last_name
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

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
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "preferredPaddle": user.accountmodel.preferredPaddle,
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
            return Response(data=data)
        return Response(serializer.errors, status=400)

def upload_image(request):
    if request.method == 'POST' and request.FILES.get('image'):
        image = image_to_base64(request.FILES['image'])
        
        fs = FileSystemStorage(location=settings.MEDIA_ROOT)
        filename = fs.save(image.name, image)
        user = request.user
        user.accountmodel.avatar = filename
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
    if request.method == 'PUT':  # Ensure it's a PUT request
        try:
            # Parse JSON data from the request body
            data = json.loads(request.body)
            current_password = data.get("current_password")
            new_password = data.get("new_password")
            confirm_password = data.get("new_password2")

            # Ensure all required fields are provided
            if not current_password or not new_password or not confirm_password:
                return JsonResponse(
                    {"success": False, "message": "All fields are required."}, status=400
                )

            if new_password != confirm_password:
                return JsonResponse(
                    {"success": False, "message": "New passwords do not match."}, status=400
                )

            # Get the logged-in user (assuming session-based authentication)
            if not request.user.is_authenticated:
                return JsonResponse({"success": False, "message": "Unauthorized."}, status=401)

            user = request.user

            # Check if the current password is correct
            if not user.check_password(current_password):
                return JsonResponse(
                    {"success": False, "message": "Current password is incorrect."}, status=400
                )

            # Validate the new password
            try:
                validate_password(new_password, user)
            except ValidationError as e:
                return JsonResponse({"success": False, "errors": list(e.messages)}, status=400)

            # Update the password
            user.set_password(new_password)
            user.save()

            return JsonResponse({"success": True, "message": "Password updated successfully!"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON data."}, status=400)

    return JsonResponse({"success": False, "message": "Invalid request method."}, status=405)

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