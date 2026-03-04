import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';       // For *ngIf and *ngFor
import { FormsModule } from '@angular/forms';         // For [(ngModel)]
import { HttpClientModule, HttpClient } from '@angular/common/http';

interface Exercise {
  id: string;
  exerciseName: string;
  type: string;
  duration: number;
  caloriesBurned: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class AppComponent implements OnInit {
  exercises: Exercise[] = [];
  newExercise: Exercise = { id: '', exerciseName: '', type: 'Cardio', duration: 0, caloriesBurned: 0 };
  apiUrl = 'http://localhost:5038/api/exercises';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getExercises();
  }

  getExercises() {
    this.http.get<Exercise[]>(`${this.apiUrl}/GetExercises`)
      .subscribe(res => this.exercises = res);
  }

  addExercise() {
    this.http.post(`${this.apiUrl}/AddExercise`, this.newExercise)
      .subscribe(() => {
        this.getExercises();
        this.newExercise = { id: '', exerciseName: '', type: 'Cardio', duration: 0, caloriesBurned: 0 };
      });
  }

  deleteExercise(id: string) {
    this.http.delete(`${this.apiUrl}/DeleteExercise?id=${id}`)
      .subscribe(() => this.getExercises());
  }

  trackById(index: number, item: Exercise) {
    return item.id;
  }
}
