import request from 'supertest';
import express, { Application } from 'express';
import ChallengeController from '../challenge.controller';
import ChallengeService from '../../modules/services/challenge.service';
import TaskRunnerService from '../../modules/services/task.runner.service';

jest.mock('../../modules/services/challenge.service');
jest.mock('../../modules/services/task.runner.service');
jest.mock('../../middlewares/jwt.middleware', () => (req: any, res: any, next: any) => {
  req.user = { login: 'testuser', id: 1, email: 'test@example.com' };
  next();
});

describe('ChallengeController - Integration Tests', () => {
  let app: Application;
  let challengeController: ChallengeController;
  let mockChallengeService: jest.Mocked<ChallengeService>;
  let mockTaskRunnerService: jest.Mocked<TaskRunnerService>;

  beforeAll(() => {
    // Given
    app = express();
    app.use(express.json());
    challengeController = new ChallengeController();
    app.use(challengeController.router);

    mockChallengeService = (challengeController as any).challengeService;
    mockTaskRunnerService = (challengeController as any).taskRunnerService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/challenge/categories', () => {
    it('should return all categories successfully', async () => {
      // Given
      const mockCategories = [
        { id: 1, name: 'Web', nicename: 'web' },
        { id: 2, name: 'Crypto', nicename: 'crypto' }
      ];
      mockChallengeService.getCategories = jest.fn().mockResolvedValue(mockCategories);

      // When
      const response = await request(app)
        .post('/api/challenge/categories')
        .send({});

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: true,
        categories: mockCategories,
        message: 'Categories.'
      });
      expect(mockChallengeService.getCategories).toHaveBeenCalled();
    });

    it('should handle service error when fetching categories', async () => {
      // Given
      mockChallengeService.getCategories = jest.fn().mockRejectedValue(new Error('Database error'));

      // When
      const response = await request(app)
        .post('/api/challenge/categories')
        .send({});

      // Then
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: false,
        message: 'Failed to get categories.'
      });
    });
  });

  describe('POST /api/challenge/category', () => {
    it('should return category details by nicename', async () => {
      // Given
      const mockCategory = {
        id: 1,
        name: 'Web Security',
        nicename: 'web',
        details: 'Web exploitation',
        url: '/categories/web',
        icon: 'web-icon.png'
      };
      mockChallengeService.getCategory = jest.fn().mockResolvedValue(mockCategory);

      // When
      const response = await request(app)
        .post('/api/challenge/category')
        .send({ nicename: 'web' });

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: true,
        category: mockCategory,
        message: 'Category info.'
      });
      expect(mockChallengeService.getCategory).toHaveBeenCalledWith('web');
    });

    it('should return 400 when nicename is missing', async () => {
      // Given: No nicename provided
      // When
      const response = await request(app)
        .post('/api/challenge/category')
        .send({});

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: false,
        message: 'Must be nicename.'
      });
    });

    it('should return 404 when category not found', async () => {
      // Given
      mockChallengeService.getCategory = jest.fn().mockResolvedValue(null);

      // When
      const response = await request(app)
        .post('/api/challenge/category')
        .send({ nicename: 'nonexistent' });

      // Then
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: false,
        message: 'Category not found.'
      });
    });
  });

  describe('POST /api/challenge/category_tasks', () => {
    it('should return tasks for a category', async () => {
      // Given
      const mockTasks = [
        { id: 'task-1', title: 'SQL Injection', points: 100 },
        { id: 'task-2', title: 'XSS Attack', points: 150 }
      ];
      mockChallengeService.getCategoryTasks = jest.fn().mockResolvedValue(mockTasks);

      // When
      const response = await request(app)
        .post('/api/challenge/category_tasks')
        .send({ category: 'web' });

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: true,
        tasks: mockTasks,
        message: 'Category tasks.'
      });
      expect(mockChallengeService.getCategoryTasks).toHaveBeenCalledWith('web', 'testuser');
    });

    it('should return 400 when category is missing', async () => {
      // Given
      // When
      const response = await request(app)
        .post('/api/challenge/category_tasks')
        .send({});

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: false,
        message: 'Must be category.'
      });
    });

    it('should handle service error', async () => {
      // Given
      mockChallengeService.getCategoryTasks = jest.fn().mockRejectedValue(new Error('Database error'));

      // When
      const response = await request(app)
        .post('/api/challenge/category_tasks')
        .send({ category: 'web' });

      // Then
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: false,
        message: 'Failed to get category tasks.'
      });
    });
  });

  describe('POST /api/challenge/verify_flag', () => {
    it('should verify correct flag successfully', async () => {
      // Given
      mockChallengeService.verifyFlag = jest.fn().mockResolvedValue(true);

      // When
      const response = await request(app)
        .post('/api/challenge/verify_flag')
        .send({
          task_id: 'task-123',
          flag: 'CTF{correct_flag}'
        });

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: true,
        message: 'Flag verified successfully.'
      });
      expect(mockChallengeService.verifyFlag).toHaveBeenCalledWith('testuser', 'task-123', 'CTF{correct_flag}');
    });

    it('should reject incorrect flag', async () => {
      // Given
      mockChallengeService.verifyFlag = jest.fn().mockResolvedValue(false);

      // When
      const response = await request(app)
        .post('/api/challenge/verify_flag')
        .send({
          task_id: 'task-123',
          flag: 'CTF{wrong_flag}'
        });

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: false,
        message: 'Flag not verified.'
      });
    });

    it('should return 400 when flag is missing', async () => {
      // Given
      // When
      const response = await request(app)
        .post('/api/challenge/verify_flag')
        .send({ task_id: 'task-123' });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: false,
        message: 'Must be flag and task_id.'
      });
    });

    it('should return 400 when task_id is missing', async () => {
      // Given: No task_id provided
      // When
      const response = await request(app)
        .post('/api/challenge/verify_flag')
        .send({ flag: 'CTF{test_flag}' });

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: false,
        message: 'Must be flag and task_id.'
      });
    });

    it('should handle service error during verification', async () => {
      // Given
      mockChallengeService.verifyFlag = jest.fn().mockRejectedValue(new Error('Verification error'));

      // When
      const response = await request(app)
        .post('/api/challenge/verify_flag')
        .send({
          task_id: 'task-123',
          flag: 'CTF{test_flag}'
        });

      // Then
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: false,
        message: 'Failed to verify flag.'
      });
    });
  });

  describe('POST /api/challenge/start_container', () => {
    it('should start container successfully', async () => {
      // Given
      const mockResult = {
        status: true,
        url: 'http://localhost:8080',
        expires_at: '2024-12-31T23:59:59Z'
      };
      mockTaskRunnerService.startContainer = jest.fn().mockResolvedValue(mockResult);

      // When
      const response = await request(app)
        .post('/api/challenge/start_container')
        .send({ task_id: 'task-123' });

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(mockTaskRunnerService.startContainer).toHaveBeenCalledWith('testuser', 'task-123');
    });

    it('should return 400 when task_id is missing', async () => {
      // Given: No task_id provided
      // When
      const response = await request(app)
        .post('/api/challenge/start_container')
        .send({});

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: false,
        message: 'Must provide task_id'
      });
    });

    it('should handle container start error', async () => {
      // Given
      mockTaskRunnerService.startContainer = jest.fn().mockRejectedValue(new Error('Container limit reached'));

      // When
      const response = await request(app)
        .post('/api/challenge/start_container')
        .send({ task_id: 'task-123' });

      // Then
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: false,
        message: 'Container limit reached'
      });
    });
  });

  describe('POST /api/challenge/stop_container', () => {
    it('should stop container successfully', async () => {
      // Given
      const mockResult = {
        status: true,
        message: 'Container stopped'
      };
      mockTaskRunnerService.stopContainer = jest.fn().mockResolvedValue(mockResult);

      // When
      const response = await request(app)
        .post('/api/challenge/stop_container')
        .send({ task_id: 'task-123' });

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(mockTaskRunnerService.stopContainer).toHaveBeenCalledWith('testuser', 'task-123');
    });

    it('should return 400 when task_id is missing', async () => {
      // Given
      // When
      const response = await request(app)
        .post('/api/challenge/stop_container')
        .send({});

      // Then
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: false,
        message: 'Must provide task_id'
      });
    });

    it('should handle container stop error', async () => {
      // Given
      mockTaskRunnerService.stopContainer = jest.fn().mockRejectedValue(new Error('Container not found'));

      // When
      const response = await request(app)
        .post('/api/challenge/stop_container')
        .send({ task_id: 'task-123' });

      // Then
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: false,
        message: 'Container not found'
      });
    });
  });

  describe('GET /api/challenge/task_details/:task_id', () => {
    it('should return task details', async () => {
      // Given
      const mockDetails = {
        status: true,
        files: ['challenge.zip'],
        container: false
      };
      mockTaskRunnerService.getTaskDetails = jest.fn().mockResolvedValue(mockDetails);

      // When
      const response = await request(app)
        .get('/api/challenge/task_details/task-123');

      // Then
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDetails);
      expect(mockTaskRunnerService.getTaskDetails).toHaveBeenCalledWith('testuser', 'task-123');
    });

    it('should handle task details error', async () => {
      // Given
      mockTaskRunnerService.getTaskDetails = jest.fn().mockRejectedValue(new Error('Task not found'));

      // When
      const response = await request(app)
        .get('/api/challenge/task_details/task-999');

      // Then
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: false,
        message: 'Task not found'
      });
    });
  });

  describe('GET /api/challenge/download/:task_id/:filename', () => {
    it('should download file successfully', async () => {
      // Given
      const mockBuffer = Buffer.from('file content');
      mockTaskRunnerService.downloadTaskFile = jest.fn().mockResolvedValue(mockBuffer);

      // When
      const response = await request(app)
        .get('/api/challenge/download/task-123/challenge.zip');

      // Then
      expect(response.status).toBe(200);
      expect(response.headers['content-disposition']).toBe('attachment; filename="challenge.zip"');
      expect(response.headers['content-type']).toBe('application/octet-stream');
      expect(mockTaskRunnerService.downloadTaskFile).toHaveBeenCalledWith('task-123', 'challenge.zip');
    });

    it('should return 404 when file not found', async () => {
      // Given
      mockTaskRunnerService.downloadTaskFile = jest.fn().mockRejectedValue(new Error('File not found'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // When
      const response = await request(app)
        .get('/api/challenge/download/task-123/missing.zip');

      // Then
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: false,
        message: 'File not found'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'File download error - Task: task-123, Filename: missing.zip, Error: File not found'
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
