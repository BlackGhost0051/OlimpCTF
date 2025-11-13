import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user/user.service';
import { UserProfile } from '../../models/user';

@Component({
  selector: 'app-profile-edit',
  imports: [CommonModule],
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

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  private loadUserProfile() {
    this.loading = true;
    this.error = undefined;

    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
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
}
