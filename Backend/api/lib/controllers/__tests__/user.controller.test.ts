import request from 'supertest';
import express, { Application } from 'express';
import UserController from '../user.controller';
import UserService from '../../modules/services/user.service';
import JwtService from '../../modules/services/jwt.service';

jest.mock('../../modules/services/user.service');
jest.mock('../../modules/services/jwt.service');
jest.mock('../../middlewares/jwt.middleware', () => (req: any, res: any, next: any) => {
  req.user = { login: 'testuser', id: 1, email: 'test@example.com' };
  next();
});

describe('UserController - Integration Tests', () => {
  let app: Application;
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeAll(() => {
    // Given
    app = express();
    app.use(express.json());
    userController = new UserController();
    app.use(userController.router);

    mockUserService = (userController as any).userService;
    mockJwtService = (userController as any).jwtService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/user/register', () => {
    it('should register a new user successfully', async () => {
      // Given
      const mockUser = {
        id: 1,
        login: 'newuser',
        email: 'newuser@example.com',
        isadmin: false,
        created_at: new Date()
      };
      const mockToken = 'jwt.token.here';

      mockUserService.register = jest.fn().mockResolvedValue(mockUser);
      mockJwtService.generateToken = jest.fn().mockReturnValue(mockToken);

      // When
      const response = await request(app)
        .post('/api/user/register')
        .send({
          login: 'newuser',
          email: 'newuser@example.com',
          password: 'SecurePassword123!'
        });

      // Then
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ token: mockToken });
      expect(mockUserService.register).toHaveBeenCalledWith('newuser', 'newuser@example.com', 'SecurePassword123!');
      expect(mockJwtService.generateToken).toHaveBeenCalledWith('newuser');
    });

    it('should return 400 when login is missing', async () => {
      // Given: No login provided
      // When
      const response = await request(app)
        .post('/api/user/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Login, password and email are required.'
      });
    });

    it('should return 400 when password is missing', async () => {
      // Given: No password provided
      // When
      const response = await request(app)
        .post('/api/user/register')
        .send({
          login: 'testuser',
          email: 'test@example.com'
        });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Login, password and email are required.'
      });
    });

    it('should return 400 when email is missing', async () => {
      // Given: No email provided
      // When
      const response = await request(app)
        .post('/api/user/register')
        .send({
          login: 'testuser',
          password: 'password123'
        });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Login, password and email are required.'
      });
    });

    it('should return 400 when email format is invalid', async () => {
      // Given: Invalid email format
      // When
      const response = await request(app)
        .post('/api/user/register')
        .send({
          login: 'testuser',
          email: 'invalid-email',
          password: 'password123'
        });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid email format.'
      });
    });

    it('should return 400 when user already exists (duplicate)', async () => {
      // Given: User already exists
      mockUserService.register = jest.fn().mockRejectedValue(new Error('Login or email already in use'));

      // When
      const response = await request(app)
        .post('/api/user/register')
        .send({
          login: 'existinguser',
          email: 'existing@example.com',
          password: 'password123'
        });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Login or email already in use'
      });
    });

    it('should handle very long passwords', async () => {
      // Given: Very long password
      const longPassword = 'A'.repeat(1000);
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        isadmin: false,
        created_at: new Date()
      };
      const mockToken = 'jwt.token.here';

      mockUserService.register = jest.fn().mockResolvedValue(mockUser);
      mockJwtService.generateToken = jest.fn().mockReturnValue(mockToken);

      // When
      const response = await request(app)
        .post('/api/user/register')
        .send({
          login: 'testuser',
          email: 'test@example.com',
          password: longPassword
        });

      // Then
      expect(response.status).toBe(201);
      expect(mockUserService.register).toHaveBeenCalledWith('testuser', 'test@example.com', longPassword);
    });

    it('should handle email with special characters', async () => {
      // Given: Email with special characters
      const specialEmail = 'user+test.name@sub-domain.example.co.uk';
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: specialEmail,
        isadmin: false,
        created_at: new Date()
      };
      const mockToken = 'jwt.token.here';

      mockUserService.register = jest.fn().mockResolvedValue(mockUser);
      mockJwtService.generateToken = jest.fn().mockReturnValue(mockToken);

      // When
      const response = await request(app)
        .post('/api/user/register')
        .send({
          login: 'testuser',
          email: specialEmail,
          password: 'password123'
        });

      // Then
      expect(response.status).toBe(201);
      expect(mockUserService.register).toHaveBeenCalledWith('testuser', specialEmail, 'password123');
    });

    it('should handle registration service errors', async () => {
      // Given: Service throws an error
      mockUserService.register = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      // When
      const response = await request(app)
        .post('/api/user/register')
        .send({
          login: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Database connection failed'
      });
    });
  });

  describe('POST /api/user/login', () => {
    it('should login user with valid credentials', async () => {
      // Given
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        isAdmin: false
      };
      const mockToken = 'jwt.token.here';

      mockUserService.login = jest.fn().mockResolvedValue(mockUser);
      mockJwtService.generateToken = jest.fn().mockReturnValue(mockToken);

      // When
      const response = await request(app)
        .post('/api/user/login')
        .send({
          login: 'testuser',
          password: 'password123'
        });

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        token: mockToken,
        message: 'User is logged.'
      });
      expect(mockUserService.login).toHaveBeenCalledWith('testuser', 'password123');
    });

    it('should return 400 when login is missing', async () => {
      // Given: No login provided
      // When
      const response = await request(app)
        .post('/api/user/login')
        .send({
          password: 'password123'
        });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Login and password are required.'
      });
    });

    it('should return 400 when password is missing', async () => {
      // Given: No password provided
      // When
      const response = await request(app)
        .post('/api/user/login')
        .send({
          login: 'testuser'
        });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Login and password are required.'
      });
    });

    it('should return 401 when credentials are invalid', async () => {
      // Given: Invalid credentials
      mockUserService.login = jest.fn().mockRejectedValue(new Error('Invalid credentials'));

      // When
      const response = await request(app)
        .post('/api/user/login')
        .send({
          login: 'testuser',
          password: 'wrongpassword'
        });

      // Then
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Invalid credentials'
      });
    });

    it('should return 401 when user not found', async () => {
      // Given: User doesn't exist
      mockUserService.login = jest.fn().mockRejectedValue(new Error('User not found'));

      // When
      const response = await request(app)
        .post('/api/user/login')
        .send({
          login: 'nonexistent',
          password: 'password123'
        });

      // Then
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'User not found'
      });
    });
  });

  describe('GET /api/user/profile', () => {
    it('should return current user profile', async () => {
      // Given
      const mockProfile = {
        login: 'testuser',
        email: 'test@example.com',
        name: 'Test',
        lastname: 'User',
        bio: 'Test bio',
        statistics: { total_points: 100, completed_tasks: 5 },
        rank: 10
      };

      mockUserService.getProfile = jest.fn().mockResolvedValue(mockProfile);

      // When
      const response = await request(app)
        .get('/api/user/profile');

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfile);
      expect(mockUserService.getProfile).toHaveBeenCalledWith('testuser', 'testuser');
    });

    it('should return 400 when profile fetch fails', async () => {
      // Given
      mockUserService.getProfile = jest.fn().mockRejectedValue(new Error('Profile not found'));

      // When
      const response = await request(app)
        .get('/api/user/profile');

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Profile not found'
      });
    });
  });

  describe('GET /api/user/profile/:login', () => {
    it('should return user profile by login', async () => {
      // Given
      const mockProfile = {
        login: 'otheruser',
        email: 'other@example.com',
        name: 'Other',
        lastname: 'User',
        statistics: { total_points: 200 },
        rank: 5
      };

      mockUserService.getProfile = jest.fn().mockResolvedValue(mockProfile);

      // When
      const response = await request(app)
        .get('/api/user/profile/otheruser');

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfile);
      expect(mockUserService.getProfile).toHaveBeenCalledWith('otheruser', 'testuser');
    });

    it('should return 404 when user profile not found', async () => {
      // Given
      mockUserService.getProfile = jest.fn().mockRejectedValue(new Error('User not found'));

      // When
      const response = await request(app)
        .get('/api/user/profile/nonexistent');

      // Then
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'User not found'
      });
    });

    it('should return 404 when accessing private profile', async () => {
      // Given
      mockUserService.getProfile = jest.fn().mockRejectedValue(new Error('This profile is private'));

      // When
      const response = await request(app)
        .get('/api/user/profile/privateuser');

      // Then
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'This profile is private'
      });
    });
  });

  describe('PATCH /api/user/change_password', () => {
    it('should change password successfully', async () => {
      // Given
      mockUserService.change_password = jest.fn().mockResolvedValue(undefined);

      // When
      const response = await request(app)
        .patch('/api/user/change_password')
        .send({
          password: 'oldPassword123',
          new_password: 'newPassword456'
        });

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Password changed successfully'
      });
      expect(mockUserService.change_password).toHaveBeenCalledWith('testuser', 'oldPassword123', 'newPassword456');
    });

    it('should return 400 when current password is missing', async () => {
      // Given: No current password
      // When
      const response = await request(app)
        .patch('/api/user/change_password')
        .send({
          new_password: 'newPassword456'
        });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Password and new password are required.'
      });
    });

    it('should return 400 when new password is missing', async () => {
      // Given: No new password
      // When
      const response = await request(app)
        .patch('/api/user/change_password')
        .send({
          password: 'oldPassword123'
        });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Password and new password are required.'
      });
    });

    it('should return 400 when current password is incorrect', async () => {
      // Given
      mockUserService.change_password = jest.fn().mockRejectedValue(new Error('Current password is incorrect'));

      // When
      const response = await request(app)
        .patch('/api/user/change_password')
        .send({
          password: 'wrongPassword',
          new_password: 'newPassword456'
        });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Current password is incorrect'
      });
    });
  });

  describe('PATCH /api/user/privacy', () => {
    it('should update privacy setting to private', async () => {
      // Given
      mockUserService.updatePrivacy = jest.fn().mockResolvedValue(undefined);

      // When
      const response = await request(app)
        .patch('/api/user/privacy')
        .send({ isPrivate: true });

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Privacy settings updated successfully'
      });
      expect(mockUserService.updatePrivacy).toHaveBeenCalledWith('testuser', true);
    });

    it('should update privacy setting to public', async () => {
      // Given
      mockUserService.updatePrivacy = jest.fn().mockResolvedValue(undefined);

      // When
      const response = await request(app)
        .patch('/api/user/privacy')
        .send({ isPrivate: false });

      // Then
      expect(response.status).toBe(200);
      expect(mockUserService.updatePrivacy).toHaveBeenCalledWith('testuser', false);
    });

    it('should return 400 when isPrivate is not a boolean', async () => {
      // Given: Invalid isPrivate value
      // When
      const response = await request(app)
        .patch('/api/user/privacy')
        .send({ isPrivate: 'yes' });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'isPrivate must be a boolean'
      });
    });
  });

  describe('PATCH /api/user/icon', () => {
    it('should update user icon successfully', async () => {
      // Given
      const iconData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
      mockUserService.updateIcon = jest.fn().mockResolvedValue(undefined);

      // When
      const response = await request(app)
        .patch('/api/user/icon')
        .send({ icon: iconData });

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Icon updated successfully'
      });
      expect(mockUserService.updateIcon).toHaveBeenCalledWith('testuser', iconData);
    });

    it('should return 400 when icon is missing', async () => {
      // Given: No icon provided
      // When
      const response = await request(app)
        .patch('/api/user/icon')
        .send({});

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Icon is required.'
      });
    });

    it('should return 400 when icon format is invalid', async () => {
      // Given: Invalid icon format
      mockUserService.updateIcon = jest.fn().mockRejectedValue(new Error('Invalid image format. Must be a base64 encoded image.'));

      // When
      const response = await request(app)
        .patch('/api/user/icon')
        .send({ icon: 'invalid-icon-data' });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid image format. Must be a base64 encoded image.'
      });
    });
  });

  describe('PATCH /api/user/profile', () => {
    it('should update profile successfully', async () => {
      // Given
      mockUserService.updateProfile = jest.fn().mockResolvedValue(undefined);

      // When
      const response = await request(app)
        .patch('/api/user/profile')
        .send({
          name: 'Updated',
          lastname: 'Name',
          bio: 'New bio',
          email: 'updated@example.com'
        });

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Profile updated successfully'
      });
    });

    it('should return 400 when no fields to update', async () => {
      // Given: Empty request
      // When
      const response = await request(app)
        .patch('/api/user/profile')
        .send({});

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'No fields to update'
      });
    });

    it('should handle validation errors from service', async () => {
      // Given
      mockUserService.updateProfile = jest.fn().mockRejectedValue(new Error('Name must be at least 2 characters'));

      // When
      const response = await request(app)
        .patch('/api/user/profile')
        .send({ name: 'A' });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Name must be at least 2 characters'
      });
    });
  });

  describe('GET /api/user/leaderboard', () => {
    it('should return leaderboard with default limit', async () => {
      // Given
      const mockLeaderboard = [
        { rank: 1, login: 'user1', totalPoints: 1000, completedTasks: 20 },
        { rank: 2, login: 'user2', totalPoints: 800, completedTasks: 15 }
      ];

      mockUserService.getLeaderboard = jest.fn().mockResolvedValue(mockLeaderboard);

      // When
      const response = await request(app)
        .get('/api/user/leaderboard');

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLeaderboard);
      expect(mockUserService.getLeaderboard).toHaveBeenCalledWith(100);
    });

    it('should return leaderboard with custom limit', async () => {
      // Given
      const mockLeaderboard = [
        { rank: 1, login: 'user1', totalPoints: 1000, completedTasks: 20 }
      ];

      mockUserService.getLeaderboard = jest.fn().mockResolvedValue(mockLeaderboard);

      // When
      const response = await request(app)
        .get('/api/user/leaderboard?limit=50');

      // Then
      expect(response.status).toBe(200);
      expect(mockUserService.getLeaderboard).toHaveBeenCalledWith(50);
    });

    it('should enforce maximum limit of 100', async () => {
      // Given
      mockUserService.getLeaderboard = jest.fn().mockResolvedValue([]);

      // When
      const response = await request(app)
        .get('/api/user/leaderboard?limit=200');

      // Then
      expect(response.status).toBe(200);
      expect(mockUserService.getLeaderboard).toHaveBeenCalledWith(100);
    });
  });
});
