from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.utils.translation import gettext as _
from accounts.models import *
from ..serializers import UpdateUserSerializer, UpdatePasswordSerializer
from rest_framework.generics import UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.decorators import login_required


# from django.views.decorators.csrf import csrf_exempt
import json

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

def tournament_menu(request):
    return render(request, 'index.html', {'current_page': 'tournament-menu'})

def tournament_lobby(request):
    return render(request, 'index.html', {'current_page': 'tournament-lobby'})

def tournament_join(request):
    return render(request, 'index.html', {'current_page': 'tournament-join'})

def index(request):
    return render(request, 'index.html', {})


def register_user(request):
    if request.method == 'POST':
        try:
            # Parse JSON body
            data = json.loads(request.body)

            # Extract data
            name = data.get('name', '')
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            email = data.get('email', '')
            password = data.get('password', '')
            confirm_password = data.get('confirm_password', '')
            gdpr_consent = data.get('gdpr_consent', False)

            # Validation
            if not name or not email or not password:
                return JsonResponse({'success': False, 'error': 'Missing required fields.'}, status=400)

            if password != confirm_password:
                return JsonResponse({'success': False, 'error': 'Passwords do not match.'}, status=400)

            # Check if user exists
            if User.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'error': 'Email is already registered.'}, status=400)

            # Create user
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

def get_user_scores(request, username):
    try:
        user = User.objects.get(username=username)
        return JsonResponse({
            'games': user.accountmodel.avatar
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

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

def get_user_paddle(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        return JsonResponse({
            'preferredPaddle': user.accountmodel.preferredPaddle
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

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
                "last_name": user.last_name
            }

            # Return user data in JSON response
            return JsonResponse({
                "message": "Login successful",
                "user": user_data
            }, status=200)
        else:
            return JsonResponse({"message": "Invalid credentials"}, status=400)

    return JsonResponse({"message": "Invalid request method"}, status=405)

@login_required
def upload_avatar(request):
    print(f"Request method: {request.method}")
    print(f"Request FIELDS: {request.FILES}")

    if request.method == "POST":
        if 'fileInput' in request.FILES:
            profile_picture = request.FILES['fileInput']
            print(f"Received file: {profile_picture.name} (size: {profile_picture.size} bytes)")

            # Save the file to the user’s avatar field
            user = request.user
            user.accountmodel.avatar = profile_picture
            user.save()
            return JsonResponse({"message": "Uploaded successfully"}, status=200)
        else:
            print("No file found in request.FILES")
            return JsonResponse({"message": "No file uploaded"}, status=400)

    return JsonResponse({"message": "Invalid request method"}, status=405)


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


