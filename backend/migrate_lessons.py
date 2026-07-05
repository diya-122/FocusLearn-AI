from courses.models import Course, Lesson, Enrollment

workspace = Course.objects.filter(title='My Personal Workspace').first()
if workspace:
    for lesson in workspace.lessons.all():
        new_course = Course.objects.create(
            title=lesson.title,
            instructor=workspace.instructor,
            description=f'Imported video: {lesson.title}',
            category='Personal',
            difficulty='Beginner',
            is_published=False
        )
        lesson.course = new_course
        lesson.save()
        Enrollment.objects.get_or_create(student=workspace.instructor, course=new_course)
    
    workspace.delete()
    print("Migration completed!")
else:
    print("No workspace found.")
