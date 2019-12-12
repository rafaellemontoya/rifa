import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { InicioComponent } from './pages/inicio/inicio.component';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/firestore';
import { AppRoutingModule } from '../app-routing.module';
import {APP_BASE_HREF} from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
const routes: Routes = [];
@NgModule({

  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AppRoutingModule,
    AngularFirestoreModule,
    HttpClientModule,
    HttpClientJsonpModule,
    AngularFireStorageModule,
    FormsModule,
    RouterModule.forRoot(routes, {useHash: true})

  ],
  declarations: [AppComponent, InicioComponent, HeaderComponent],

  providers: [AngularFirestore],
  bootstrap: [AppComponent]
})
export class AppModule { }
