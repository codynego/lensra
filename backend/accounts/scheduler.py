from apscheduler.schedulers.background import BackgroundScheduler
from django.core.management import call_command

def start():
    scheduler = BackgroundScheduler()
    # Run every Sunday at 2 AM
    scheduler.add_job(
        lambda: call_command('cleanup_profile_pictures'),
        'cron',
        day_of_week='sun',
        hour=2,
        minute=0
    )
    scheduler.start()
