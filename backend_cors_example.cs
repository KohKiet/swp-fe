var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ADD CORS CONFIGURATION HERE
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // React dev server URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add your other services here (AuthService, etc.)

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// USE CORS BEFORE AUTHORIZATION - ORDER IS IMPORTANT!
app.UseCors("AllowReactApp");

app.UseAuthentication(); // if you have it
app.UseAuthorization();

app.MapControllers();

app.Run(); 