using Dapper;
using Npgsql;
using WebApi.Models;
using WebApi.Services.Interface;

namespace WebApi.Services;

public class CourseRepository(NpgsqlDataSource dataSource) : ICourseRepository
{
    public async Task<int> AddAsync(Course entity)
    {
        const string sql = """
                           INSERT INTO course (code, name, user_id, start_time, end_time)
                           VALUES (@Code, @Name, @UserId, @StartTime, @EndTime)
                           RETURNING id;
                           """;

        await using var conn = await dataSource.OpenConnectionAsync();
        var id = await conn.ExecuteScalarAsync<int>(sql, entity);
        return id;
    }

    public async Task<int> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM course WHERE id = @Id;";
        
        await using var conn = await dataSource.OpenConnectionAsync();
        var rows = await conn.ExecuteAsync(sql, new { Id = id });
        
        return rows;
    }

    public async Task<IReadOnlyList<Course>> GetAllAsync()
    {
        const string sql = "SELECT * FROM course ORDER BY id;";
    
        await using var conn = await dataSource.OpenConnectionAsync();
        var result = await conn.QueryAsync<Course>(sql);
        
        return result.ToList();
    }

    public async Task<Course?> GetByIdAsync(int id)
    {
        const string sql = "SELECT * FROM course WHERE id=@Id;";
       
        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<Course>(sql, new { Id = id });
    }

    public async Task<int> UpdateAsync(Course entity)
    {
        const string sql = """
                           UPDATE course
                           SET code = @Code,
                               name = @Name,
                               user_id = @UserId,
                               start_time = @StartTime,
                               end_time = @EndTime
                           WHERE id = @id;
                           """;

        await using var conn = await dataSource.OpenConnectionAsync();
        var rows = await conn.ExecuteAsync(sql, entity);
      
        return rows;
    }
}