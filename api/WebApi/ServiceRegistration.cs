using WebApi.Services;
using WebApi.Services.Interface;

namespace WebApi;

public static class ServiceRegistration
{
    public static void AddInfrastructure(this IServiceCollection services)
    {
        services.AddTransient<IUsersRepository, UsersRepository>();
        services.AddTransient<IStudentRepository, StudentRepository>();
        services.AddTransient<ISessionsRepository, SessionsRepository>();
        services.AddTransient<ILecturerRepository, LectureRepository>();
        services.AddTransient<IEnrolmentRepository, EnrolmentRepository>();
        services.AddTransient<ICourseRepository, CourseRepository>();
        services.AddTransient<IAttendanceRepository, AttendanceRepository>();

        services.AddTransient<IFaceService, FaceService>();
    }
}