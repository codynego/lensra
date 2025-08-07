# views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login
from .forms import UserRegistrationForm


def register_view(request):
    form = UserRegistrationForm()

    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('dashboard:photographer_dashboard' if user.role == 'photographer' else 'dashboard:client_dashboard')
    else:
        form = UserRegistrationForm() 
    return render(request, 'accounts/register.html', {'form': form})
