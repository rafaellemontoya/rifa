import { Component, OnInit, ElementRef } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, finalize } from 'rxjs/operators';
import { Asistente } from '../../interfaces/asistente.interface';
import { AngularFireStorage } from '@angular/fire/storage';
import { Location } from '@angular/common';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {


  private itemsCollection: AngularFirestoreCollection<Videos>;
  itemsVideosGuardados: Observable<Videos[]>;
  numeroRifa=0;
  mensajeErrorImg = '';
  claseCargaImg = '';
  porcentajeCargaImg: any;
  submitted = false;
  imgError = false;
  selectedFile = null;
  estadoCargaImg = false;
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  key = 'CsiHCHA3p37pEKX5cFcz';
  //private itemsCollection: AngularFirestoreCollection<Dashboard>;
  private itemsCollectionVideo: AngularFirestoreCollection<Videos>;
  items: Observable<Dashboard[]>;
  itemsNumeroRifa: Observable<any[]>;
  estadoReproduccion = 'Listo para reproduccion';
  claseReproduccion = 'btn btn-success br2 btn-xs fs12 dropdown-toggle';
  reproduciendo = false;

  item: Dashboard = {
    ventas: 0,
    mensaje: '',
    video: '',
    duracionVideo: 0,
    tempHoy: '',
    videoplay: 0
  };
  itemVideo: Videos = {

    url: '',
    duracionVideo: 0,
    nombre: ''
  };

  constructor(private afs: AngularFirestore, private storage: AngularFireStorage, private location: Location) { }

  ngOnInit() {
    this.getDashboardInfo();
    this.getInfo();
    this.getNumeroRifa();
  }


  getDashboardInfo() {

    this.items = this.afs.collectionGroup<Dashboard>('video')
      .valueChanges();
    this.items.subscribe(elements => {

      this.item.duracionVideo = elements[0].duracionVideo;
      this.item.video = elements[0].video;
      this.item.videoplay = elements[0].videoplay;
      //console.log(elements[0].video.duration);
    });
  }

  crearItem() {

    //this.item.usuarioAlta = keyUser;
    const itemDoc = this.afs.doc<Dashboard>('/video/0e7ph94uzUhSqTGeq8pG');
    itemDoc.update(this.item);

  }
  cancel() {
    this.location.back();
  }

  /*Carga de imagenes */
  getFile(event) {
    this.imgError = false;


    this.selectedFile = event.target.files[0];
    console.log(event.target.files[0].type);
    // this.uploadFile();
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].type === 'video/mp4') {


        if (event.target.files[0].size < 10000000) {//
          this.itemVideo.duracionVideo = event.target;
          console.log(this.selectedFile.duration);

          this.uploadFile(event.target.id);
        } else {
          // Peso inválido

          this.mensajeErrorImg = 'Video demasiado grande. Debe pesar menos de 10 MB ';
          this.imgError = true;

          console.log('peso inválido');
        }

      } else {
        // No es imagen

        this.mensajeErrorImg = 'Formato no válido, debe ser una imagen en .mp4 ';
        this.imgError = true;

        console.log('No imagen');
        // alert('Error');
        // event.srcElement.value = '';

      }
    }
  }
  uploadFile(nombreImagen: string) {

    // Activo proceso de carga

    this.estadoCargaImg = true;
    this.claseCargaImg = 'progress-bar progress-bar-primary progress-bar-striped';

    const file = this.selectedFile;
    const filePath = 'video_dasboard/' + file.name;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    this.uploadPercent.subscribe(n => {

      this.porcentajeCargaImg = n;

      console.log(n);
    });
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL();
        this.downloadURL.subscribe(
          url => {

            this.itemVideo.nombre = file.name;
            this.itemVideo.url = url;
            this.claseCargaImg = 'progress-bar progress-bar-success';
          }
        );
      }
      )
    )
      .subscribe(
        x => console.log(fileRef.getDownloadURL));
  }

  reproducirVideo(video: Videos) {
    //
    this.reproduciendo = true;
    this.claseReproduccion = 'btn btn-danger br2 btn-xs fs12 dropdown-toggle';
    this.estadoReproduccion = 'Reproduciendo';
    // Actualizar valores 

    const itemDoc = this.afs.doc<Dashboard>('/video/0e7ph94uzUhSqTGeq8pG/');
    this.item.videoplay = -1;

    this.item.video = video.url;
    itemDoc.update(this.item);
    setTimeout(() => {
      this.item.videoplay = 1;
      itemDoc.update(this.item);

      this.reproduciendo = false;
      this.estadoReproduccion = '';
      this.claseReproduccion = 'btn btn-success br2 btn-xs fs12 dropdown-toggle';
      this.estadoReproduccion = 'Preparado';
    }, ((video.duracionVideo) * 1000));


  }
  getEstado() {
    this.itemsCollectionVideo = this.afs.collection<Videos>('/video/0e7ph94uzUhSqTGeq8pG/videos');
    // .valueChanges() is simple. It just returns the 
    // JSON data without metadata. If you need the 
    // doc.id() in the value you must persist it your self
    // or use .snapshotChanges() instead. See the addItem()
    // method below for how to persist the id with
    // valueChanges()
    this.itemsVideosGuardados = this.itemsCollectionVideo.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Videos;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))

    );
  }

  getDuration(e) {

    this.itemVideo.duracionVideo = e.target.duration ;
    console.log(this.itemVideo.duracionVideo);
    if (this.itemVideo.url !== '') {
      this.crearItemVideo();
    }
  }

  crearItemVideo() {

    const itemCollection = this.afs.collection<Videos>('/video/0e7ph94uzUhSqTGeq8pG/videos');
    itemCollection.add(this.itemVideo);
    this.itemVideo.nombre = '';
    this.itemVideo.duracionVideo = 0;
    this.itemVideo.url = '';
    this.submitted = true;
  }
  getInfo() {
    this.itemsCollectionVideo = this.afs.collection<Videos>('/video/0e7ph94uzUhSqTGeq8pG/videos');
    // .valueChanges() is simple. It just returns the 
    // JSON data without metadata. If you need the 
    // doc.id() in the value you must persist it your self
    // or use .snapshotChanges() instead. See the addItem()
    // method below for how to persist the id with
    // valueChanges()
    this.itemsVideosGuardados = this.itemsCollectionVideo.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Videos;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))

    );
    this.itemsVideosGuardados.subscribe(elements => {
      console.log(elements);
    });
  }

  eliminar(id: string, video: Videos) {
    console.log(id, video);

    const itemDoc = this.afs.doc<Dashboard>('/video/0e7ph94uzUhSqTGeq8pG/videos/' + id);

    itemDoc.delete();
    return this.storage.storage.refFromURL(video.url).delete();
  }

  reiniciar(){
    const itemDoc = this.afs.doc<Dashboard>('/video/0e7ph94uzUhSqTGeq8pG/');
    this.item.videoplay = 0;

    itemDoc.update(this.item);
  }

  getNumeroRifa() {
    this.itemsNumeroRifa = this.afs.collectionGroup<any>('rifa')
      .valueChanges();
    this.itemsNumeroRifa.subscribe(elements => {

      this.numeroRifa = elements[0].numeroRifa;
      console.log(elements);

    
    });
  }
}
