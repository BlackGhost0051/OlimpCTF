import ChallengeService from '../challenge.service';
import DatabaseService from '../database.service';
import TaskRunnerService from '../task.runner.service';

jest.mock('../database.service');
jest.mock('../task.runner.service');

describe('ChallengeService - Unit Tests', () => {
  let challengeService: ChallengeService;
  let mockDatabaseService: jest.Mocked<DatabaseService>;
  let mockTaskRunnerService: jest.Mocked<TaskRunnerService>;

  beforeEach(() => {
    // Arrange
    jest.clearAllMocks();

    challengeService = new ChallengeService();
    mockDatabaseService = (challengeService as any).databaseService;
    mockTaskRunnerService = (challengeService as any).taskRunnerService;
  });

  describe('getCategory', () => {
    it('should retrieve category by nicename', async () => {
      // Arrange
      const nicename = 'web';
      const mockCategory = {
        id: 1,
        name: 'Web Security',
        nicename: 'web',
        details: 'Web exploitation challenges',
        url: '/categories/web',
        icon: 'web-icon.png'
      };
      mockDatabaseService.getCategoryByNicename = jest.fn().mockResolvedValue(mockCategory);

      // Act
      const result = await challengeService.getCategory(nicename);

      // Assert
      expect(mockDatabaseService.getCategoryByNicename).toHaveBeenCalledWith(nicename);
      expect(result).toEqual(mockCategory);
    });

    it('should handle category not found', async () => {
      // Arrange
      const nicename = 'nonexistent';
      mockDatabaseService.getCategoryByNicename = jest.fn().mockResolvedValue(null);

      // Act
      const result = await challengeService.getCategory(nicename);

      // Assert
      expect(result).toBeNull();
      expect(mockDatabaseService.getCategoryByNicename).toHaveBeenCalledWith(nicename);
    });
  });

  describe('getCategories', () => {
    it('should retrieve all categories', async () => {
      // Arrange
      const mockCategories = [
        { id: 1, name: 'Web', nicename: 'web' },
        { id: 2, name: 'Crypto', nicename: 'crypto' },
        { id: 3, name: 'Reverse', nicename: 'reverse' }
      ];
      mockDatabaseService.getCategories = jest.fn().mockResolvedValue(mockCategories);

      // Act
      const result = await challengeService.getCategories();

      // Assert
      expect(mockDatabaseService.getCategories).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
      expect(result.length).toBe(3);
    });

    it('should return empty array when no categories exist', async () => {
      // Arrange
      mockDatabaseService.getCategories = jest.fn().mockResolvedValue([]);

      // Act
      const result = await challengeService.getCategories();

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('getCategoryTasks', () => {
    it('should retrieve tasks for a category and user', async () => {
      // Arrange
      const category = 'web';
      const login = 'testuser';
      const mockUser = { id: 1, login: 'testuser', email: 'test@example.com' };
      const mockTasks = [
        { id: 'task-1', title: 'SQL Injection', points: 100 },
        { id: 'task-2', title: 'XSS Attack', points: 150 }
      ];

      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);
      mockDatabaseService.getTasksByCategory = jest.fn().mockResolvedValue(mockTasks);

      // Act
      const result = await challengeService.getCategoryTasks(category, login);

      // Assert
      expect(mockDatabaseService.getUser).toHaveBeenCalledWith(login);
      expect(mockDatabaseService.getTasksByCategory).toHaveBeenCalledWith(category, mockUser.id);
      expect(result).toEqual(mockTasks);
      expect(result.length).toBe(2);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const category = 'web';
      const login = 'nonexistent';
      mockDatabaseService.getUser = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(challengeService.getCategoryTasks(category, login)).rejects.toThrow('User not found');
      expect(mockDatabaseService.getUser).toHaveBeenCalledWith(login);
    });
  });

  describe('verifyFlag', () => {
    it('should verify correct flag and save completion for first solve', async () => {
      // Arrange
      const login = 'testuser';
      const taskId = 'task-123';
      const flag = 'CTF{correct_flag}';
      const mockUser = { id: 1, login: 'testuser', email: 'test@example.com' };

      mockTaskRunnerService.verifyFlag = jest.fn().mockResolvedValue(true);
      mockDatabaseService.hasUserCompletedTask = jest.fn().mockResolvedValue(false);
      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);
      mockDatabaseService.saveUserTaskCompletion = jest.fn().mockResolvedValue(undefined);

      // Act
      const result = await challengeService.verifyFlag(login, taskId, flag);

      // Assert
      expect(mockTaskRunnerService.verifyFlag).toHaveBeenCalledWith(taskId, flag);
      expect(mockDatabaseService.hasUserCompletedTask).toHaveBeenCalledWith(login, taskId);
      expect(mockDatabaseService.getUser).toHaveBeenCalledWith(login);
      expect(mockDatabaseService.saveUserTaskCompletion).toHaveBeenCalledWith(mockUser.id, taskId);
      expect(result).toBe(true);
    });

    it('should verify correct flag but not save if already completed', async () => {
      // Arrange
      const login = 'testuser';
      const taskId = 'task-123';
      const flag = 'CTF{correct_flag}';
      const mockUser = { id: 1, login: 'testuser', email: 'test@example.com' };

      mockTaskRunnerService.verifyFlag = jest.fn().mockResolvedValue(true);
      mockDatabaseService.hasUserCompletedTask = jest.fn().mockResolvedValue(true);
      mockDatabaseService.getUser = jest.fn().mockResolvedValue(mockUser);
      mockDatabaseService.saveUserTaskCompletion = jest.fn().mockResolvedValue(undefined);

      // Act
      const result = await challengeService.verifyFlag(login, taskId, flag);

      // Assert
      expect(mockTaskRunnerService.verifyFlag).toHaveBeenCalledWith(taskId, flag);
      expect(mockDatabaseService.hasUserCompletedTask).toHaveBeenCalledWith(login, taskId);
      expect(mockDatabaseService.saveUserTaskCompletion).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false for incorrect flag', async () => {
      // Arrange
      const login = 'testuser';
      const taskId = 'task-123';
      const flag = 'CTF{wrong_flag}';

      mockTaskRunnerService.verifyFlag = jest.fn().mockResolvedValue(false);

      // Act
      const result = await challengeService.verifyFlag(login, taskId, flag);

      // Assert
      expect(mockTaskRunnerService.verifyFlag).toHaveBeenCalledWith(taskId, flag);
      expect(mockDatabaseService.hasUserCompletedTask).not.toHaveBeenCalled();
      expect(mockDatabaseService.saveUserTaskCompletion).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should not save completion if user not found', async () => {
      // Arrange
      const login = 'testuser';
      const taskId = 'task-123';
      const flag = 'CTF{correct_flag}';

      mockTaskRunnerService.verifyFlag = jest.fn().mockResolvedValue(true);
      mockDatabaseService.hasUserCompletedTask = jest.fn().mockResolvedValue(false);
      mockDatabaseService.getUser = jest.fn().mockResolvedValue(null);
      mockDatabaseService.saveUserTaskCompletion = jest.fn().mockResolvedValue(undefined);

      // Act
      const result = await challengeService.verifyFlag(login, taskId, flag);

      // Assert
      expect(mockTaskRunnerService.verifyFlag).toHaveBeenCalledWith(taskId, flag);
      expect(mockDatabaseService.getUser).toHaveBeenCalledWith(login);
      expect(mockDatabaseService.saveUserTaskCompletion).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('addTask', () => {
    it('should add task to both database and task runner', async () => {
      // Arrange
      const mockTask = {
        id: undefined as any,
        title: 'New Challenge',
        description: 'Test challenge',
        points: 100,
        category: 'web',
        difficulty: 'easy'
      };
      const flag = 'CTF{test_flag}';

      mockDatabaseService.addTask = jest.fn().mockResolvedValue(undefined);
      mockTaskRunnerService.addTask = jest.fn().mockResolvedValue(undefined);

      // Act
      await challengeService.addTask(mockTask, flag);

      // Assert
      expect(mockTask.id).toBeDefined();
      expect(mockDatabaseService.addTask).toHaveBeenCalledWith(mockTask);
      expect(mockTaskRunnerService.addTask).toHaveBeenCalledWith(mockTask.id, flag);
    });

    it('should handle add task error', async () => {
      // Arrange
      const mockTask = {
        id: undefined as any,
        title: 'New Challenge',
        description: 'Test challenge',
        points: 100,
        category: 'web',
        difficulty: 'easy'
      };
      const flag = 'CTF{test_flag}';
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockDatabaseService.addTask = jest.fn().mockRejectedValue(new Error('Database error'));

      // Act
      await challengeService.addTask(mockTask, flag);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteTask', () => {
    it('should delete task from both database and task runner', async () => {
      // Arrange
      const taskId = 'task-123';
      mockDatabaseService.deleteTask = jest.fn().mockResolvedValue(undefined);
      mockTaskRunnerService.deleteTask = jest.fn().mockResolvedValue(undefined);

      // Act
      await challengeService.deleteTask(taskId);

      // Assert
      expect(mockDatabaseService.deleteTask).toHaveBeenCalledWith(taskId);
      expect(mockTaskRunnerService.deleteTask).toHaveBeenCalledWith(taskId);
    });

    it('should handle delete task error gracefully', async () => {
      // Arrange
      const taskId = 'task-123';
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockDatabaseService.deleteTask = jest.fn().mockRejectedValue(new Error('Delete failed'));

      // Act
      await challengeService.deleteTask(taskId);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('createCategory', () => {
    it('should create new category with all details', async () => {
      // Arrange
      const name = 'Web Security';
      const nicename = 'web';
      const details = 'Web exploitation challenges';
      const url = '/categories/web';
      const icon = 'web-icon.png';
      const mockResult = { id: 1, name, nicename, details, url, icon };

      mockDatabaseService.createCategory = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await challengeService.createCategory(name, nicename, details, url, icon);

      // Assert
      expect(mockDatabaseService.createCategory).toHaveBeenCalledWith(name, nicename, details, url, icon);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateCategory', () => {
    it('should update existing category', async () => {
      // Arrange
      const id = 1;
      const name = 'Updated Web Security';
      const nicename = 'web';
      const details = 'Updated details';
      const url = '/categories/web';
      const icon = 'new-icon.png';
      const mockResult = { id, name, nicename, details, url, icon };

      mockDatabaseService.updateCategory = jest.fn().mockResolvedValue(mockResult);

      // Act
      const result = await challengeService.updateCategory(id, name, nicename, details, url, icon);

      // Assert
      expect(mockDatabaseService.updateCategory).toHaveBeenCalledWith(id, name, nicename, details, url, icon);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getAllTasks', () => {
    it('should retrieve all tasks from database', async () => {
      // Arrange
      const mockTasks = [
        { id: 'task-1', title: 'Challenge 1', points: 100 },
        { id: 'task-2', title: 'Challenge 2', points: 200 },
        { id: 'task-3', title: 'Challenge 3', points: 300 }
      ];
      mockDatabaseService.getAllTasks = jest.fn().mockResolvedValue(mockTasks);

      // Act
      const result = await challengeService.getAllTasks();

      // Assert
      expect(mockDatabaseService.getAllTasks).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);
      expect(result.length).toBe(3);
    });
  });

  describe('addTaskToBackendOnly', () => {
    it('should add task to database only', async () => {
      // Arrange
      const mockTask = {
        id: 'task-123',
        title: 'Backend Only Task',
        description: 'Test task',
        points: 100,
        category: 'web',
        difficulty: 'easy'
      };
      mockDatabaseService.addTask = jest.fn().mockResolvedValue(undefined);

      // Act
      await challengeService.addTaskToBackendOnly(mockTask);

      // Assert
      expect(mockDatabaseService.addTask).toHaveBeenCalledWith(mockTask);
      expect(mockTaskRunnerService.addTask).not.toHaveBeenCalled();
    });

    it('should throw error if database add fails', async () => {
      // Arrange
      const mockTask = {
        id: 'task-123',
        title: 'Backend Only Task',
        description: 'Test task',
        points: 100,
        category: 'web',
        difficulty: 'easy'
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockDatabaseService.addTask = jest.fn().mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(challengeService.addTaskToBackendOnly(mockTask)).rejects.toThrow('Database error');
      expect(mockDatabaseService.addTask).toHaveBeenCalledWith(mockTask);

      consoleErrorSpy.mockRestore();
    });
  });
});
