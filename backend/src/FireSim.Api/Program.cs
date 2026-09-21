using FireSim.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS 정책 추가 (프론트엔드 포트 허용)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

// 데이터베이스 컨텍스트 설정 (SQL Server 연동)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS 미들웨어 적용 (MapControllers 보다 위에 위치해야 정상 동작합니다)
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();