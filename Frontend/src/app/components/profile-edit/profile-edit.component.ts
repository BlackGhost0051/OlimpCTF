import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { UserProfile } from '../../models/user';

@Component({
  selector: 'app-profile-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss'
})
export class ProfileEditComponent implements OnInit {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploadError: string | null = null;
  uploadSuccess: string | null = null;
  uploading: boolean = false;

  userProfile?: UserProfile;
  loading: boolean = true;
  error?: string;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  saving: boolean = false;
  saveSuccess: string | null = null;
  saveError: string | null = null;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  private initializeForms() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      login: ['', [Validators.required, Validators.minLength(3)]],
      bio: ['', [Validators.maxLength(500)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  private loadUserProfile() {
    this.loading = true;
    this.error = undefined;

    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.profileForm.patchValue({
          name: profile.name,
          lastname: profile.lastname,
          login: profile.login,
          bio: profile.bio,
          email: profile.email
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load profile';
        this.loading = false;
        console.error('Error loading profile:', err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];


      if (!file.type.startsWith('image/')) {
        this.uploadError = 'Please select an image file (PNG, JPG, etc.)';
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.uploadError = 'Image size must be less than 5MB';
        return;
      }

      this.selectedFile = file;
      this.uploadError = null;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadIcon(): void {
    if (!this.previewUrl) {
      this.uploadError = 'Please select an image first';
      return;
    }

    this.uploading = true;
    this.uploadError = null;
    this.uploadSuccess = null;

    this.userService.uploadIcon(this.previewUrl).subscribe({
      next: (response) => {
        this.uploadSuccess = 'Icon uploaded successfully!';
        this.uploading = false;
        setTimeout(() => {
          this.uploadSuccess = null;
        }, 3000);
      },
      error: (error) => {
        this.uploadError = error.error?.error || 'Failed to upload icon';
        this.uploading = false;
      }
    });
  }

  clearSelection(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.uploadError = null;
    this.uploadSuccess = null;
  }

  togglePrivacy(): void {
    if (!this.userProfile) return;

    const newPrivacySetting = !this.userProfile.isPrivate;

    this.userService.updatePrivacy(newPrivacySetting).subscribe({
      next: () => {
        if (this.userProfile) {
          this.userProfile.isPrivate = newPrivacySetting;
        }
      },
      error: (err) => {
        console.error('Error updating privacy settings:', err);
        alert('Failed to update privacy settings');
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.saveError = null;
    this.saveSuccess = null;

    const formData = this.profileForm.value;

    this.userService.updateProfile(formData).subscribe({
      next: () => {
        this.saveSuccess = 'Profile updated successfully!';
        this.saving = false;
        this.loadUserProfile();
        setTimeout(() => {
          this.saveSuccess = null;
        }, 3000);
      },
      error: (err) => {
        this.saveError = err.error?.error || 'Failed to update profile';
        this.saving = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.saveError = null;
    this.saveSuccess = null;

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.userService.updatePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.saveSuccess = 'Password changed successfully!';
        this.saving = false;
        this.passwordForm.reset();
        setTimeout(() => {
          this.saveSuccess = null;
        }, 3000);
      },
      error: (err) => {
        this.saveError = err.error?.error || 'Failed to change password';
        this.saving = false;
      }
    });
  }

  getFieldError(formGroup: FormGroup, fieldName: string): string | null {
    const field = formGroup.get(fieldName);
    if (field?.invalid && (field?.dirty || field?.touched)) {
      if (field.errors?.['required']) return 'This field is required';
      if (field.errors?.['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength}`;
      if (field.errors?.['maxlength']) return `Maximum length is ${field.errors['maxlength'].requiredLength}`;
      if (field.errors?.['email']) return 'Invalid email format';
    }
    return null;
  }

  get passwordMismatch(): boolean {
    return this.passwordForm.errors?.['passwordMismatch'] &&
           this.passwordForm.get('confirmPassword')?.touched || false;
  }
}
