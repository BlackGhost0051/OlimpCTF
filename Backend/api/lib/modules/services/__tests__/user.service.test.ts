import UserService from '../user.service';
import DatabaseService from '../database.service';
import PasswordService from '../password.service';

jest.mock('../database.service');
jest.mock('../password.service');

describe('UserService - Unit Tests', () => {
  let userService: UserService;
  let mockDatabaseService: jest.Mocked<DatabaseService>;
  let mockPasswordService: jest.Mocked<PasswordService>;

  beforeEach(() => {
    // Arrange
    jest.clearAllMocks();

    userService = new UserService();
    mockDatabaseService = (userService as any).databaseService;
    mockPasswordService = (userService as any).passwordService;
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const login = 'newuser';
      const email = 'newuser@example.com';
      const password = 'SecurePassword123!';
      const hashedPassword = '$2b$10$hashedpassword';
      const newUser = {
        id: 1,
        login: 'newuser',
        email: 'newuser@example.com',
        password: hashedPassword,
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(null);
      mockPasswordService.hashPassword = jest.fn().mockResolvedValue(hashedPassword);
      mockDatabaseService.addUser = jest.fn().mockResolvedValue(newUser);

      // Act
      const result = await userService.register(login, email, password);

      // Assert
      expect(mockDatabaseService.getUser).toHaveBeenCalledWith(login);
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(password);
      expect(mockDatabaseService.addUser).toHaveBeenCalledWith(login, email, hashedPassword);
      expect(result).toEqual(newUser);
    });

    it('should throw error when user already exists (duplicate login)', async () => {
      // Arrange
      const login = 'existinguser';
      const email = 'newemail@example.com';
      const password = 'password123';
      const existingUser = {
        id: 1,
        login: 'existinguser',
        email: 'existing@example.com',
        password: '$2b$10$existinghash',
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(existingUser);

      // Act & Assert
      await expect(userService.register(login, email, password)).rejects.toThrow('Login or email already in use');
      expect(mockDatabaseService.getUser).toHaveBeenCalledWith(login);
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(mockDatabaseService.addUser).not.toHaveBeenCalled();
    });

    it('should handle very long passwords', async () => {
      // Arrange
      const login = 'testuser';
      const email = 'test@example.com';
      const longPassword = 'A'.repeat(1000); // 1000 character password
      const hashedPassword = '$2b$10$hashedlongpassword';
      const newUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(null);
      mockPasswordService.hashPassword = jest.fn().mockResolvedValue(hashedPassword);
      mockDatabaseService.addUser = jest.fn().mockResolvedValue(newUser);

      // Act
      const result = await userService.register(login, email, longPassword);

      // Assert
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(longPassword);
      expect(result).toEqual(newUser);
    });

    it('should handle email with special characters', async () => {
      // Arrange
      const login = 'specialuser';
      const email = 'user+test.name@sub-domain.example.co.uk';
      const password = 'password123';
      const hashedPassword = '$2b$10$hashedpassword';
      const newUser = {
        id: 1,
        login: 'specialuser',
        email: email,
        password: hashedPassword,
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(null);
      mockPasswordService.hashPassword = jest.fn().mockResolvedValue(hashedPassword);
      mockDatabaseService.addUser = jest.fn().mockResolvedValue(newUser);

      // Act
      const result = await userService.register(login, email, password);

      // Assert
      expect(mockDatabaseService.addUser).toHaveBeenCalledWith(login, email, hashedPassword);
      expect(result).toEqual(newUser);
    });

    it('should handle password hashing failure', async () => {
      // Arrange
      const login = 'testuser';
      const email = 'test@example.com';
      const password = 'password123';

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(null);
      mockPasswordService.hashPassword = jest.fn().mockRejectedValue(new Error('Hashing failed'));

      // Act & Assert
      await expect(userService.register(login, email, password)).rejects.toThrow('Hashing failed');
      expect(mockDatabaseService.addUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      // Arrange
      const login = 'testuser';
      const password = 'correctPassword';
      const hashedPassword = '$2b$10$hashedpassword';
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);
      mockPasswordService.comparePassword = jest.fn().mockResolvedValue(true);

      // Act
      const result = await userService.login(login, password);

      // Assert
      expect(mockDatabaseService.getUser).toHaveBeenCalledWith(login);
      expect(mockPasswordService.comparePassword).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual({
        id: mockUser.id,
        login: mockUser.login,
        email: mockUser.email,
        isAdmin: mockUser.isadmin
      });
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const login = 'nonexistent';
      const password = 'password123';

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(userService.login(login, password)).rejects.toThrow('User not found');
      expect(mockPasswordService.comparePassword).not.toHaveBeenCalled();
    });

    it('should throw error when password is invalid', async () => {
      // Arrange
      const login = 'testuser';
      const password = 'wrongPassword';
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);
      mockPasswordService.comparePassword = jest.fn().mockResolvedValue(false);

      // Act & Assert
      await expect(userService.login(login, password)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getUser', () => {
    it('should retrieve user by identifier', async () => {
      // Arrange
      const identifier = 'testuser';
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$hash',
        isadmin: false,
        created_at: new Date('2024-01-01')
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUser(identifier);

      // Assert
      expect(mockDatabaseService.getUser).toHaveBeenCalledWith(identifier);
      expect(result).toEqual({
        id: mockUser.id,
        login: mockUser.login,
        email: mockUser.email,
        isAdmin: mockUser.isadmin,
        created_at: mockUser.created_at
      });
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const identifier = 'nonexistent';
      mockDatabaseService.getUser = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUser(identifier)).rejects.toThrow('User not found');
    });
  });

  describe('getProfile', () => {
    it('should retrieve user profile with statistics', async () => {
      // Arrange
      const identifier = 'testuser';
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        name: 'Test',
        lastname: 'User',
        bio: 'Test bio',
        isprivate: false,
        icon: 'data:image/png;base64,test',
        email_verified: true,
        created_at: new Date(),
        password: '$2b$10$hash',
        isadmin: false
      };
      const mockStatistics = {
        total_points: 100,
        completed_tasks: 5,
        category_breakdown: [] as any[]
      };
      const mockRank = 10;

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);
      mockDatabaseService.getUserStatistics = jest.fn().mockResolvedValue(mockStatistics);
      mockDatabaseService.getUserRank = jest.fn().mockResolvedValue(mockRank);

      // Act
      const result = await userService.getProfile(identifier);

      // Assert
      expect(mockDatabaseService.getUser).toHaveBeenCalledWith(identifier);
      expect(mockDatabaseService.getUserStatistics).toHaveBeenCalledWith(mockUser.login);
      expect(mockDatabaseService.getUserRank).toHaveBeenCalledWith(mockUser.login);
      expect(result.login).toBe(mockUser.login);
      expect(result.statistics).toEqual(mockStatistics);
      expect(result.rank).toBe(mockRank);
    });

    it('should throw error when accessing private profile of another user', async () => {
      // Arrange
      const identifier = 'privateuser';
      const requestingUser = 'otheruser';
      const mockUser = {
        id: 1,
        login: 'privateuser',
        email: 'private@example.com',
        isprivate: true,
        name: 'Private',
        lastname: 'User',
        bio: '',
        icon: null as any,
        email_verified: false,
        created_at: new Date(),
        password: '$2b$10$hash',
        isadmin: false
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.getProfile(identifier, requestingUser)).rejects.toThrow('This profile is private');
    });

    it('should allow user to view their own private profile', async () => {
      // Arrange
      const identifier = 'privateuser';
      const requestingUser = 'privateuser';
      const mockUser = {
        id: 1,
        login: 'privateuser',
        email: 'private@example.com',
        isprivate: true,
        name: 'Private',
        lastname: 'User',
        bio: 'My bio',
        icon: null as any,
        email_verified: false,
        created_at: new Date(),
        password: '$2b$10$hash',
        isadmin: false
      };
      const mockStatistics = { total_points: 50, completed_tasks: 2, category_breakdown: [] as any[] };
      const mockRank = 20;

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);
      mockDatabaseService.getUserStatistics = jest.fn().mockResolvedValue(mockStatistics);
      mockDatabaseService.getUserRank = jest.fn().mockResolvedValue(mockRank);

      // Act
      const result = await userService.getProfile(identifier, requestingUser);

      // Assert
      expect(result.login).toBe(mockUser.login);
      expect(result.isPrivate).toBe(true);
    });
  });

  describe('change_password', () => {
    it('should change password successfully', async () => {
      // Arrange
      const login = 'testuser';
      const currentPassword = 'oldPassword123';
      const newPassword = 'newPassword456';
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$oldhash',
        isadmin: false,
        created_at: new Date()
      };
      const newHashedPassword = '$2b$10$newhash';

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);
      mockPasswordService.comparePassword = jest.fn().mockResolvedValue(true);
      mockPasswordService.hashPassword = jest.fn().mockResolvedValue(newHashedPassword);
      mockDatabaseService.updateUserPassword = jest.fn().mockResolvedValue(undefined);

      // Act
      await userService.change_password(login, currentPassword, newPassword);

      // Assert
      expect(mockPasswordService.comparePassword).toHaveBeenCalledWith(currentPassword, mockUser.password);
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(newPassword);
      expect(mockDatabaseService.updateUserPassword).toHaveBeenCalledWith(login, newHashedPassword);
    });

    it('should throw error when current password is incorrect', async () => {
      // Arrange
      const login = 'testuser';
      const currentPassword = 'wrongPassword';
      const newPassword = 'newPassword456';
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$oldhash',
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);
      mockPasswordService.comparePassword = jest.fn().mockResolvedValue(false);

      // Act & Assert
      await expect(userService.change_password(login, currentPassword, newPassword)).rejects.toThrow('Current password is incorrect');
      expect(mockDatabaseService.updateUserPassword).not.toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update profile with valid data', async () => {
      // Arrange
      const login = 'testuser';
      const updateData = {
        name: 'Updated Name',
        lastname: 'Updated Lastname',
        bio: 'Updated bio',
        email: 'updated@example.com'
      };
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'old@example.com',
        name: 'Old',
        lastname: 'Name',
        bio: 'Old bio',
        password: '$2b$10$hash',
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null); // For email uniqueness check
      mockDatabaseService.updateUserProfile = jest.fn().mockResolvedValue(undefined);

      // Act
      await userService.updateProfile(login, updateData);

      // Assert
      expect(mockDatabaseService.updateUserProfile).toHaveBeenCalledWith(login, updateData);
    });

    it('should throw error when name is too short', async () => {
      // Arrange
      const login = 'testuser';
      const updateData = { name: 'A' }; // Too short
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$hash',
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.updateProfile(login, updateData)).rejects.toThrow('Name must be at least 2 characters');
    });

    it('should throw error when bio is too long', async () => {
      // Arrange
      const login = 'testuser';
      const updateData = { bio: 'A'.repeat(501) }; // Too long
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$hash',
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.updateProfile(login, updateData)).rejects.toThrow('Bio must not exceed 500 characters');
    });

    it('should throw error when email format is invalid', async () => {
      // Arrange
      const login = 'testuser';
      const updateData = { email: 'invalid-email' };
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$hash',
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.updateProfile(login, updateData)).rejects.toThrow('Invalid email format');
    });

    it('should throw error when email is already in use by another user', async () => {
      // Arrange
      const login = 'testuser';
      const updateData = { email: 'taken@example.com' };
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$hash',
        isadmin: false,
        created_at: new Date()
      };
      const existingEmailUser = {
        id: 2,
        login: 'otheruser',
        email: 'taken@example.com',
        password: '$2b$10$hash',
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(existingEmailUser);

      // Act & Assert
      await expect(userService.updateProfile(login, updateData)).rejects.toThrow('Email already in use');
    });
  });

  describe('updatePrivacy', () => {
    it('should update privacy setting', async () => {
      // Arrange
      const login = 'testuser';
      const isPrivate = true;
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$hash',
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);
      mockDatabaseService.updateUserPrivacy = jest.fn().mockResolvedValue(undefined);

      // Act
      await userService.updatePrivacy(login, isPrivate);

      // Assert
      expect(mockDatabaseService.updateUserPrivacy).toHaveBeenCalledWith(login, isPrivate);
    });
  });

  describe('updateIcon', () => {
    it('should update user icon with valid base64 image', async () => {
      // Arrange
      const login = 'testuser';
      const iconBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$hash',
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);
      mockDatabaseService.updateUserIcon = jest.fn().mockResolvedValue(undefined);

      // Act
      await userService.updateIcon(login, iconBase64);

      // Assert
      expect(mockDatabaseService.updateUserIcon).toHaveBeenCalledWith(login, iconBase64);
    });

    it('should throw error when icon format is invalid', async () => {
      // Arrange
      const login = 'testuser';
      const invalidIcon = 'not-a-valid-image';
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$hash',
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.updateIcon(login, invalidIcon)).rejects.toThrow('Invalid image format');
    });

    it('should throw error when icon is too large', async () => {
      // Arrange
      const login = 'testuser';
      const largeIcon = 'data:image/png;base64,' + 'A'.repeat(6 * 1024 * 1024); // > 5MB
      const mockUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$hash',
        isadmin: false,
        created_at: new Date()
      };

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.updateIcon(login, largeIcon)).rejects.toThrow('Image too large');
    });
  });

  describe('getLeaderboard', () => {
    it('should retrieve leaderboard with default limit', async () => {
      // Arrange
      const mockLeaderboardData = [
        {
          login: 'user1',
          name: 'User',
          lastname: 'One',
          icon: null as any,
          total_points: '1000',
          completed_tasks: '20',
          created_at: new Date()
        },
        {
          login: 'user2',
          name: 'User',
          lastname: 'Two',
          icon: null as any,
          total_points: '800',
          completed_tasks: '15',
          created_at: new Date()
        }
      ];

      mockDatabaseService.getLeaderboard = jest.fn().mockResolvedValue(mockLeaderboardData);

      // Act
      const result = await userService.getLeaderboard();

      // Assert
      expect(mockDatabaseService.getLeaderboard).toHaveBeenCalledWith(100);
      expect(result).toHaveLength(2);
      expect(result[0].rank).toBe(1);
      expect(result[0].totalPoints).toBe(1000);
      expect(result[1].rank).toBe(2);
    });
  });
});
