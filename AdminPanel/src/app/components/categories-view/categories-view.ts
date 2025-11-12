import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';
import { Category } from '../../models/category';

@Component({
  selector: 'app-categories-view',
  standalone: true,
  imports: [
    CardModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TagModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './categories-view.html',
  styleUrl: './categories-view.scss',
})
export class CategoriesView implements OnInit {
  categories: Category[] = [];
  selectedCategory: Category | null = null;
  displayEditDialog = false;
  selectedIconFile: File | null = null;
  iconPreviewUrl: string | null = null;
  loading = false;

  editedCategory: Partial<Category> = {
    name: '',
    nicename: '',
    details: '',
    url: '',
    icon: ''
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.adminService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loading = false;
      }
    });
  }

  editCategory(category: Category): void {
    this.selectedCategory = category;
    this.editedCategory = { ...category };
    this.iconPreviewUrl = category.icon || null;
    this.displayEditDialog = true;
  }

  onIconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select an image file (PNG, JPG, GIF, SVG)');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Image size must be less than 5MB');
        return;
      }

      this.selectedIconFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.iconPreviewUrl = reader.result as string;
        this.editedCategory.icon = this.iconPreviewUrl;
      };
      reader.readAsDataURL(file);
    }
  }

  clearIconSelection(): void {
    this.selectedIconFile = null;
    this.iconPreviewUrl = null;
    this.editedCategory.icon = '';
  }

  saveCategory(): void {
    if (this.selectedCategory && this.selectedCategory.id) {
      this.adminService.updateCategory(this.selectedCategory.id, this.editedCategory).subscribe({
        next: (data) => {
          console.log('Category updated:', data);
          this.loadCategories();
          this.closeDialog();
        },
        error: (err) => {
          console.error('Error updating category:', err);
        }
      });
    }
  }

  closeDialog(): void {
    this.displayEditDialog = false;
    this.selectedCategory = null;
    this.selectedIconFile = null;
    this.iconPreviewUrl = null;
    this.editedCategory = {
      name: '',
      nicename: '',
      details: '',
      url: '',
      icon: ''
    };
  }
}
