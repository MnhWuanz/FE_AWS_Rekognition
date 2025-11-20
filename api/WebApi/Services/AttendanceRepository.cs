using Dapper;
using Npgsql;
using WebApi.Models;
using WebApi.Services.Interface;

namespace WebApi.Services;

public class AttendanceRepository(NpgsqlDataSource dataSource) : IAttendanceRepository
{
    public async Task<int> AddAsync(Attendance entity)
    {
        const string sql = """
                           INSERT INTO attendance (session_id, enrolment_id, date)
                           VALUES (@Session_id, @Enrolment_id, @Date)
                           RETURNING id
                           """;

        await using var conn = await dataSource.OpenConnectionAsync();
        var id = await conn.ExecuteScalarAsync<int>(sql, entity);
       
        return id;
    }

    public async Task<int> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM attendance WHERE id = @Id;";
        
        await using var conn = await dataSource.OpenConnectionAsync();
        var rows = await conn.ExecuteAsync(sql, new { Id = id });
        
        return rows;
    }

    public async Task<IReadOnlyList<Attendance>> GetAllAsync()
    {
        const string sql = "SELECT* FROM attendance ORDER BY id ;";
        
        await using var conn = await dataSource.OpenConnectionAsync();
        var result = await conn.QueryAsync<Attendance>(sql);
        
        return result.ToList();
    }

    public async Task<Attendance?> GetByIdAsync(int id)
    {
        const string sql = "SELECT* FROM attendance WHERE id =@Id;";
      
        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<Attendance>(sql, new { Id = id });
    }

    public async Task<int> UpdateAsync(Attendance entity)
    {
        const string sql = """
                           UPDATE attendance
                           SET session_id = @Session_id,
                               enrolment_id = @Enrolment_id,
                               date = @Date
                           WHERE id = @id;
                           """;

        await using var conn = await dataSource.OpenConnectionAsync();
        var rows = await conn.ExecuteAsync(sql, entity);
      
        return rows;
    }
}