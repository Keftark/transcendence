from django.shortcuts import render
import os
from django.http import HttpResponse
from django.contrib.auth.models import User
import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.utils.translation import gettext as _
from accounts.models import *
from ..serializers import UpdateUserSerializer, UpdatePasswordSerializer
from rest_framework.generics import UpdateAPIView
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.decorators import login_required
from dotenv import load_dotenv
from django.core.files.storage import FileSystemStorage
from django.conf import settings
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
            data = json.loads(request.body)

            name = data.get('name', '')
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            email = data.get('email', '')
            password = data.get('password', '')

            if not name or not email or not password:
                return JsonResponse({'success': False, 'error': 'Missing required fields.'}, status=400)

            if User.objects.filter(username=name).exists():
                return JsonResponse({'success': False, 'error': 'User with this name is already registered.'}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'error': 'Email is already registered.'}, status=400)

            user = User.objects.create_user(
                username=name,
                first_name=first_name,
                last_name=last_name,
                email=email,
                password=password,
            )
            user.save()
            login(request, user)

            return JsonResponse({'success': True, 'message': 'User registered and logged in successfully.'})

        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON.'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'success': False, 'error': 'Invalid request method.'}, status=405)

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
            login(request, user)
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "preferredPaddle": user.accountmodel.preferredPaddle
            }
            return JsonResponse({
                "message": "Login successful",
                "user": user_data
            }, status=200)
        else:
            return JsonResponse({"message": "Invalid credentials"}, status=400)

    return JsonResponse({"message": "Invalid request method"}, status=405)

def upload_image(request):
    if request.method == 'POST' and request.FILES.get('image'):
        image = request.FILES['image']
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


