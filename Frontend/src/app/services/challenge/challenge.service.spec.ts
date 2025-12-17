import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChallengeService } from './challenge.service';
import { environment } from '../../../environments/environment';

describe('ChallengeService - Unit Tests', () => {
    let service: ChallengeService;
    let httpMock: HttpTestingController;
    const baseUrl = environment.apiUrl + '/challenge';

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [ChallengeService]
      });
      service = TestBed.inject(ChallengeService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    describe('verifyFlag', () => {
      it('should verify flag with correct task ID and flag', (done) => {
        // Arrange
        const taskId = 'task-123';
        const flag = 'CTF{correct_flag}';
        const mockResponse = { success: true, message: 'Correct flag!' };

        // Act
        service.verifyFlag(taskId, flag).subscribe(response => {
            // Assert
            expect(response).toEqual(mockResponse);
            done();
        });

        const req = httpMock.expectOne(`${baseUrl}/verify_flag`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ task_id: taskId, flag: flag });
        req.flush(mockResponse);
      });

      it('should handle incorrect flag submission', (done) => {
        // Arrange
        const taskId = 'task-123';
        const wrongFlag = 'CTF{wrong_flag}';
        const mockResponse = { success: false, message: 'Incorrect flag' };

        // Act
        service.verifyFlag(taskId, wrongFlag).subscribe((response: any) => {
          // Assert
          expect(response).toEqual(mockResponse);
          expect(response.success).toBe(false);
          done();
        });

        const req = httpMock.expectOne(`${baseUrl}/verify_flag`);
        req.flush(mockResponse);
      });
    });

    describe('getCategoryTasks', () => {
      it('should retrieve tasks for a specific category', (done) => {
        // Arrange
        const category = 'web';
        const mockTasks = [
          { id: '1', name: 'SQL Injection', points: 100 },
          { id: '2', name: 'XSS Attack', points: 150 }
        ];

        // Act
        service.getCategoryTasks(category).subscribe((tasks: any) => {
          // Assert
          expect(tasks).toEqual(mockTasks);
          expect(tasks.length).toBe(2);
          done();
        });

        const req = httpMock.expectOne(`${baseUrl}/category_tasks`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ category: category });
        req.flush(mockTasks);
      });

      it('should return empty array when category has no tasks', (done) => {
        // Arrange
        const category = 'empty-category';
        const mockTasks: any[] = [];

        // Act
        service.getCategoryTasks(category).subscribe((tasks: any) => {
          // Assert
          expect(tasks).toEqual([]);
          expect(tasks.length).toBe(0);
          done();
        });

        const req = httpMock.expectOne(`${baseUrl}/category_tasks`);
        req.flush(mockTasks);
      });
    });

    describe('getCategory', () => {
      it('should retrieve category details by nicename', (done) => {
        // Arrange
        const nicename = 'web-security';
        const mockCategory = {
          id: '1',
          name: 'Web Security',
          nicename: 'web-security',
          description: 'Web exploitation challenges'
        };

        // Act
        service.getCategory(nicename).subscribe((category: any) => {
          // Assert
          expect(category).toEqual(mockCategory);
          expect(category.nicename).toBe(nicename);
          done();
        });

        const req = httpMock.expectOne(`${baseUrl}/category`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ nicename: nicename });
        req.flush(mockCategory);
      });
    });

    describe('getCategories', () => {
      it('should retrieve all categories', (done) => {
        // Arrange
        const mockCategories = [
          { id: '1', name: 'Web', nicename: 'web' },
          { id: '2', name: 'Crypto', nicename: 'crypto' },
          { id: '3', name: 'Reverse', nicename: 'reverse' }
        ];

        // Act
        service.getCategories().subscribe((categories: any) => {
          // Assert
          expect(categories).toEqual(mockCategories);
          expect(categories.length).toBe(3);
          done();
        });

        const req = httpMock.expectOne(`${baseUrl}/categories`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({});
        req.flush(mockCategories);
      });

      it('should handle empty categories list', (done) => {
        // Arrange
        const mockCategories: any[] = [];

        // Act
        service.getCategories().subscribe((categories: any) => {
          // Assert
          expect(categories).toEqual([]);
          expect(categories.length).toBe(0);
          done();
        });

        const req = httpMock.expectOne(`${baseUrl}/categories`);
        req.flush(mockCategories);
      });
    });

    describe('startContainer', () => {
      it('should start container for a task', (done) => {
        // Arrange
        const taskId = 'task-456';
        const mockResponse = {
          success: true,
          containerId: 'container-abc',
          port: 8080,
          url: 'http://localhost:8080'
        };

        // Act
        service.startContainer(taskId).subscribe(response => {
          // Assert
          expect(response).toEqual(mockResponse);
          expect(response.success).toBe(true);
          expect(response.containerId).toBeTruthy();
          done();
        });

        const req = httpMock.expectOne(`${baseUrl}/start_container`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ task_id: taskId });
        req.flush(mockResponse);
     });

      it('should handle container start failure', (done) => {
        // Arrange
        const taskId = 'task-789';
        const mockResponse = {
            success: false,
            error: 'Container limit reached'
        };

        // Act
        service.startContainer(taskId).subscribe(response => {
          // Assert
          expect(response.success).toBe(false);
          expect(response.error).toBeTruthy();
          done();
        });

        const req = httpMock.expectOne(`${baseUrl}/start_container`);
        req.flush(mockResponse);
      });
    });

    describe('stopContainer', () => {
      it('should stop container for a task', (done) => {
        // Arrange
        const taskId = 'task-456';
        const mockResponse = {
          success: true,
          message: 'Container stopped'
        };

        // Act
        service.stopContainer(taskId).subscribe(response => {
          // Assert
          expect(response).toEqual(mockResponse);
          expect(response.success).toBe(true);
          done();
        });

        const req = httpMock.expectOne(`${baseUrl}/stop_container`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ task_id: taskId });
        req.flush(mockResponse);
      });

      it('should handle container stop failure', (done) => {
        // Arrange
        const taskId = 'task-999';
        const mockResponse = {
          success: false,
          error: 'Container not found'
        };

        // Act
        service.stopContainer(taskId).subscribe(response => {
          // Assert
          expect(response.success).toBe(false);
          expect(response.error).toBe('Container not found');
          done();
        });

        const req = httpMock.expectOne(`${baseUrl}/stop_container`);
        req.flush(mockResponse);
      });
    });

    describe('checkTaskDetails', () => {
      it('should retrieve task details by ID', (done) => {
        // Arrange
        const taskId = 'task-123';
        const mockTaskDetails = {
          id: 'task-123',
          name: 'SQL Injection Challenge',
          description: 'Find the flag in the database',
          points: 200,
          category: 'web',
          difficulty: 'medium'
        };

        // Act
        service.checkTaskDetails(taskId).subscribe(details => {
          // Assert
          expect(details).toEqual(mockTaskDetails);
          expect(details.id).toBe(taskId);
          expect(details.points).toBe(200);
          done();
        });

        const req = httpMock.expectOne(`${baseUrl}/task_details/${taskId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockTaskDetails);
      });
    });

    describe('downloadTaskFile', () => {
      it('should download task file as blob', (done) => {
        // Arrange
        const taskId = 'task-123';
        const filename = 'challenge.zip';
        const mockBlob = new Blob(['file content'], { type: 'application/zip' });

        // Act
        service.downloadTaskFile(taskId, filename).subscribe(blob => {
          // Assert
          expect(blob).toBeInstanceOf(Blob);
          expect(blob.type).toBe('application/zip');
          done();
        });

        const req = httpMock.expectOne(`${baseUrl}/download/${taskId}/${filename}`);
        expect(req.request.method).toBe('GET');
        expect(req.request.responseType).toBe('blob');
        req.flush(mockBlob);
      });

      it('should handle different file types', (done) => {
        // Arrange
        const taskId = 'task-456';
        const filename = 'exploit.py';
        const mockBlob = new Blob(['#!/usr/bin/env python3'], { type: 'text/plain' });

        // Act
        service.downloadTaskFile(taskId, filename).subscribe(blob => {
          // Assert
          expect(blob).toBeInstanceOf(Blob);
          done();
        });

        const req = httpMock.expectOne(`${baseUrl}/download/${taskId}/${filename}`);
        req.flush(mockBlob);
      });
    });
});
