import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { TaskViewComponent } from './task-view.component';
import { ChallengeService } from '../../services/challenge/challenge.service';
import { Task } from '../../models/task';

describe('TaskViewComponent - Integration Tests', () => {
    let component: TaskViewComponent;
    let fixture: ComponentFixture<TaskViewComponent>;
    let challengeService: jasmine.SpyObj<ChallengeService>;
    let mockTask: Task;

    beforeEach(async () => {
      const challengeServiceSpy = jasmine.createSpyObj('ChallengeService', [
        'verifyFlag',
        'startContainer',
        'stopContainer',
        'checkTaskDetails',
        'downloadTaskFile'
      ]);

      await TestBed.configureTestingModule({
        imports: [TaskViewComponent, HttpClientTestingModule],
        providers: [
          { provide: ChallengeService, useValue: challengeServiceSpy }
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(TaskViewComponent);
      component = fixture.componentInstance;
      challengeService = TestBed.inject(ChallengeService) as jasmine.SpyObj<ChallengeService>;

      mockTask = {
        id: 'task-123',
        title: 'SQL Injection',
        icon: 'web-icon.png',
        description: 'Find the flag',
        points: 200,
        category: 'web',
        difficulty: 'medium'
     } as Task;

      component.task = mockTask;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
   });

    describe('ngOnInit and checkTaskDetails', () => {
      it('should load task details on initialization', () => {
        // Arrange
        const mockResponse = {
          status: true,
          files: ['challenge.zip'],
          container: false
        };
        challengeService.checkTaskDetails.and.returnValue(of(mockResponse));

        // Act
        component.ngOnInit();

        // Assert
        expect(challengeService.checkTaskDetails).toHaveBeenCalledWith('task-123');
        expect(component.taskFiles).toEqual(['challenge.zip']);
        expect(component.hasContainer).toBe(false);
      });

      it('should set container info when container is running', () => {
        // Arrange
        const mockResponse = {
          status: true,
          files: [],
          container: {
              status: 'running',
              url: 'http://localhost:8080',
              expires_at: '2024-12-31T23:59:59Z'
          }
        };
        challengeService.checkTaskDetails.and.returnValue(of(mockResponse));

        // Act
        component.ngOnInit();

        // Assert
        expect(component.containerStatus).toBe('running');
        expect(component.containerUrl).toBe('http://localhost:8080');
        expect(component.expiresAt).toBeInstanceOf(Date);
        expect(component.hasContainer).toBe(true);
      });

      it('should handle task details loading error', () => {
        // Arrange
        challengeService.checkTaskDetails.and.returnValue(
          throwError(() => new Error('Network error'))
        );

        // Act
        component.ngOnInit();

        // Assert
        expect(component.containerLoading).toBe(false);
      });
    });

    describe('verifyFlag', () => {
      it('should verify correct flag and show success alert', () => {
        // Arrange
        const mockResponse = { status: true, message: 'Correct!' };
        challengeService.verifyFlag.and.returnValue(of(mockResponse));
        component.flagInput = 'CTF{correct_flag}';
        spyOn(component, 'openDialog');

        // Act
        component.verifyFlag('task-123');

        // Assert
        expect(challengeService.verifyFlag).toHaveBeenCalledWith('task-123', 'CTF{correct_flag}');
        expect(component.openDialog).toHaveBeenCalledWith('Correct flag!', 'info', jasmine.any(Function));
      });

      it('should verify incorrect flag and show error message', () => {
        // Arrange
        const mockResponse = { status: false, message: 'Incorrect flag' };
        challengeService.verifyFlag.and.returnValue(of(mockResponse));
        component.flagInput = 'CTF{wrong_flag}';
        spyOn(component, 'openDialog');

        // Act
        component.verifyFlag('task-123');

        // Assert
        expect(challengeService.verifyFlag).toHaveBeenCalledWith('task-123', 'CTF{wrong_flag}');
        expect(component.openDialog).toHaveBeenCalledWith('Incorrect flag', 'info');
      });

      it('should handle flag verification error', () => {
        // Arrange
        challengeService.verifyFlag.and.returnValue(
          throwError(() => new Error('Network error'))
        );
        component.flagInput = 'CTF{test_flag}';
        spyOn(component, 'openDialog');

        // Act
        component.verifyFlag('task-123');

        // Assert
        expect(component.openDialog).toHaveBeenCalledWith('Error verifying flag', 'info');
      });
    });

    describe('startContainer', () => {
      it('should start container successfully', () => {
        // Arrange
        const mockResponse = {
          status: true,
          url: 'http://localhost:9000',
          expires_at: '2024-12-31T23:59:59Z'
        };
        challengeService.startContainer.and.returnValue(of(mockResponse));

        // Act
        component.startContainer();

        // Assert
        expect(challengeService.startContainer).toHaveBeenCalledWith('task-123');
        expect(component.containerUrl).toBe('http://localhost:9000');
        expect(component.containerStatus).toBe('running');
        expect(component.expiresAt).toBeInstanceOf(Date);
        expect(component.containerLoading).toBe(false);
      });

      it('should handle container start error', () => {
        // Arrange
        const errorResponse = { error: { message: 'Container limit reached' } };
        challengeService.startContainer.and.returnValue(
          throwError(() => errorResponse)
        );
        spyOn(component, 'openDialog');

        // Act
        component.startContainer();

        // Assert
        expect(component.openDialog).toHaveBeenCalledWith('Error starting container: Container limit reached', 'info');
        expect(component.containerLoading).toBe(false);
      });

      it('should not start container when task ID is missing', () => {
        // Arrange
        component.task.id = undefined as any;

        // Act
        component.startContainer();

        // Assert
        expect(challengeService.startContainer).not.toHaveBeenCalled();
      });
    });

    describe('stopContainer', () => {
      it('should stop container successfully', () => {
        // Arrange
        const mockResponse = { status: true };
        challengeService.stopContainer.and.returnValue(of(mockResponse));
        component.containerUrl = 'http://localhost:8080';
        component.containerStatus = 'running';

        // Act
        component.stopContainer();

        // Assert
        expect(challengeService.stopContainer).toHaveBeenCalledWith('task-123');
        expect(component.containerUrl).toBeNull();
        expect(component.containerStatus).toBe('not_found');
        expect(component.expiresAt).toBeNull();
        expect(component.containerLoading).toBe(false);
      });

      it('should handle container stop error', () => {
        // Arrange
        const errorResponse = { error: { message: 'Container not found' } };
        challengeService.stopContainer.and.returnValue(
          throwError(() => errorResponse)
        );
        spyOn(component, 'openDialog');

        // Act
        component.stopContainer();

        // Assert
        expect(component.openDialog).toHaveBeenCalledWith('Error stopping container: Container not found', 'info');
        expect(component.containerLoading).toBe(false);
      });

      it('should not stop container when task ID is missing', () => {
        // Arrange
        component.task.id = undefined as any;

        // Act
        component.stopContainer();

        // Assert
        expect(challengeService.stopContainer).not.toHaveBeenCalled();
      });
    });

    describe('downloadFile', () => {
      it('should download file successfully', () => {
        // Arrange
        const mockBlob = new Blob(['file content'], { type: 'application/zip' });
        challengeService.downloadTaskFile.and.returnValue(of(mockBlob));
        spyOn(window.URL, 'createObjectURL').and.returnValue('blob:mock-url');
        spyOn(window.URL, 'revokeObjectURL');
        spyOn(document.body, 'appendChild');
        spyOn(document.body, 'removeChild');

        // Act
        component.downloadFile('challenge.zip');

        // Assert
        expect(challengeService.downloadTaskFile).toHaveBeenCalledWith('task-123', 'challenge.zip');
        expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
        expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      });

      it('should handle download error', () => {
        // Arrange
        const errorResponse = { error: { message: 'File not found' } };
        challengeService.downloadTaskFile.and.returnValue(
          throwError(() => errorResponse)
        );
        spyOn(component, 'openDialog');

        // Act
        component.downloadFile('missing.zip');

        // Assert
        expect(component.openDialog).toHaveBeenCalledWith('Error downloading file: File not found', 'info');
      });

      it('should not download file when task ID is missing', () => {
        // Arrange
        component.task.id = undefined as any;

        // Act
        component.downloadFile('challenge.zip');

        // Assert
        expect(challengeService.downloadTaskFile).not.toHaveBeenCalled();
      });
    });

    describe('UI interactions', () => {
      it('should emit close event when onCloseClick is called', () => {
        // Arrange
        spyOn(component.close, 'emit');

        // Act
        component.onCloseClick();

        // Assert
        expect(component.close.emit).toHaveBeenCalled();
      });

      it('should toggle hints visibility', () => {
        // Arrange
        const initialState = component.showHints;

        // Act
        component.noHintsClick();

        // Assert
        expect(component.showHints).toBe(!initialState);
      });

      it('should toggle hints multiple times', () => {
        // Arrange
        component.showHints = false;

        // Act & Assert
        component.noHintsClick();
        expect(component.showHints).toBe(true);

        component.noHintsClick();
        expect(component.showHints).toBe(false);

        component.noHintsClick();
        expect(component.showHints).toBe(true);
      });
    });
});
