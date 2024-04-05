import './main.css';
const toggleBtn = document.getElementById('toggle-btn');
const sideBar = document.getElementById('side-bar');
const mapContainer = document.getElementById('map');
const sidebarTitle = document.querySelector('#sidebar-title');
const crimesList = document.querySelector('.crimes-list');
const formAddCrime: any = document.querySelector('.form-add-crime');
const selectPersonalTipoCrimen: any = document.querySelector(
  '#crimen-personal-tipo'
);
const selectPropiedadTipoCrimen: any = document.querySelector(
  '#crimen-propiedad-tipo'
);
const selectCategoriaCrimen: any = document.querySelector('#crimen-categoria');
const inputDateCrimen: any = document.querySelector('#crimen-fecha');
const inputTituloCrimen: any = document.querySelector('#crimen-titulo');
const textareaDescripcionCrimen: any = document.querySelector(
  '#crimen-descripcion'
);
const categoriaContainer = document.querySelector('#categoria-container');
const tipoContainer = document.querySelector('#tipo-container');
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

const DELITOS_PERSONALES: Set<string[]> = new Set([
  ['HOMICIDIO', 'Homicidio'],
  ['FEMINICIDIO', 'Feminicidio'],
  ['AGRESION', 'Agresión'],
  ['ABUSO_DOMESTICO', 'Abuso doméstico'],
  ['SECUESTRO', 'Secuestro'],
  ['ASALTO', 'Asalto'],
  ['VIOLACION', 'Violación'],
  ['AGRESION_SEXUAL', 'Agresión sexual'],
]);

const DELITOS_PROPIEDAD: Set<string[]> = new Set([
  ['ROBO', 'Robo'],
  ['VANDALISMO', 'Vandalismo'],
  ['ALLANAMIENTO_DE_MORADA', 'Allanamiento de morada'],
]);

const TIPOS_CRIMEN = {
  PERSONAL: DELITOS_PERSONALES,
  PROPIEDAD: DELITOS_PROPIEDAD,
};

class Crimen {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  fechaSuceso: object;
  fechaCreacion: object;
  coords: object;

  constructor(
    id: string,
    tipo: string,
    titulo: string,
    categoria: string,
    descripcion: string,
    fechaSuceso: object,
    coords: object
  ) {
    this.id = id;
    this.tipo = tipo;
    this.titulo = titulo;
    this.categoria = categoria;
    this.descripcion = descripcion;
    this.fechaSuceso = fechaSuceso;
    this.fechaCreacion = new Date();
    this.coords = coords;
  }
}

class App {
  #map: any;
  #mapZoomLevel: number = 13;
  #mapEvent: any;
  #crimeList: object[] = [];

  constructor() {
    this._getLocation();
    this._getLocalStorage();
    this._loadListeners();
  }

  _getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        alert('No se pudo obtener tu ubicación en el mapa')
      );
    }
  }

  _loadMap(position: any) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    // @ts-ignore
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    // @ts-ignore
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Añadir listener de clicks al map
    this.#map.addEventListener('click', this._showForm.bind(this));

    this.#crimeList.forEach((crime) => {
      this._renderMarkup(crime);
    });
  }

  _renderCrimeItem(crime: any) {
    const emojiCategoria = crime.categoria === 'personal' ? `🧍` : `🏚️`;
    let emojiTipo;

    switch (crime.tipo) {
      case 'homicidio':
        emojiTipo = `👨`;
        break;
      case 'feminicidio':
        emojiTipo = `👩🏻`;
        break;
      case 'agresion':
        emojiTipo = `🗡️`;
        break;
      case 'abuso_domestico':
        emojiTipo = `🤜`;
        break;
      case 'secuestro':
        emojiTipo = `💨`;
        break;
      case 'asalto':
        emojiTipo = `🔫`;
        break;
      case 'violacion':
        emojiTipo = `💋`;
        break;
      case 'agresion_sexual':
        emojiTipo = `💔`;
        break;
      case 'robo':
        emojiTipo = `🦹🏻`;
        break;
      case 'vandalismo':
        emojiTipo = `💥`;
        break;
      case 'allanamiento_de_morada':
        emojiTipo = `🪟`;
        break;
      default:
        break;
    }

    let html = `
    <li
    data-id="${crime.id}"
    class="crimes-list-item cursor-pointer border-l-8 border-secondary-400 h-20 w-full py-2 px-3 bg-primary-400 rounded-[6px] mb-3 grid grid-cols-3 gap-2"
    >
    <h3 class="h-4 col-span-full mb-3">${this._capitalize(crime.titulo)}</h3>
    <div class="crime-details text-xs flex justify-start gap-2">
      <span class="crime-detail"> ${emojiCategoria} </span>
      <span class="crime-detail"> ${this._capitalize(crime.categoria)} </span>
    </div>
    <div class="crime-details text-xs flex justify-start gap-2">
      <span class="crime-detail"> ${emojiTipo} </span>
      <span class="crime-detail"> ${this._capitalize(crime.tipo)} </span>
    </div>
    <div class="crime-details text-xs flex justify-start gap-2">
      <span class="crime-detail"> 📅 </span>
      <span class="crime-detail"> ${crime.fechaSuceso} </span>
    </div>
  </li>
    `;
    crimesList.insertAdjacentHTML('beforeend', html);
  }

  _renderMarkup(crime: any) {
    // @ts-ignore
    L.marker(crime.coords)
      .addTo(this.#map)
      .bindPopup(
        // @ts-ignore
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${crime.tipo}-popup`,
        })
      )
      .setPopupContent(
        `${crime.categoria === 'personal' ? '🧍' : '🏚️'} ${crime.descripcion}`
      )
      .openPopup();
  }

  _moveToPopup(e: any) {
    if (!this.#map) return;
    const crimeItem = e.target.closest('.crimes-list-item');

    if (!crimeItem) return;
    const crimeObj: any = this.#crimeList.find(
      // @ts-ignore
      (crime: object) => crime.id === crimeItem.dataset.id
    );

    console.log(crimeObj);

    this.#map.setView(crimeObj.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _newCrime(e: any) {
    const validInputs = (...inputs: string[]) =>
      inputs.every((inp) => inp.length > 0);

    e.preventDefault();

    const categoria = selectCategoriaCrimen.value;
    const tipo = selectPersonalTipoCrimen.value
      ? selectPersonalTipoCrimen.value
      : selectPropiedadTipoCrimen.value;
    const titulo = inputTituloCrimen.value;
    const descripcion = textareaDescripcionCrimen.value;
    const fecha = inputDateCrimen.value;
    let id = uuidv4();
    const { lat, lng } = this.#mapEvent.latlng;
    type CrimeInstance = InstanceType<typeof Crimen>;
    let crimen: CrimeInstance;
    if (validInputs(categoria, tipo, titulo, descripcion, fecha)) {
      crimen = new Crimen(id, tipo, titulo, categoria, descripcion, fecha, {
        lat,
        lng,
      });
      this.#crimeList.push(crimen);
      this._setLocalStorage();
      this._resetForm();
      this._renderMarkup(crimen);
      this._renderCrimeItem(crimen);
    } else {
      console.log('inputs invalidos');
    }
  }

  _showForm(mapE: any) {
    this.#mapEvent = mapE;
    formAddCrime.classList.remove('hide-form');
  }

  _resetForm() {
    formAddCrime.reset();
    formAddCrime.classList.add('hide-form');
    categoriaContainer.classList.remove('hidden');
    tipoContainer.classList.add('hidden');
    selectPersonalTipoCrimen.classList.add('hidden');
    selectPropiedadTipoCrimen.classList.add('hidden');
  }

  _loadListeners() {
    // listener boton para mostrar u ocultar sidebar
    toggleBtn.addEventListener('click', () => {
      sideBar.classList.toggle('sidebar-collapsed');
      mapContainer.classList.toggle('map-expanded');
      sidebarTitle.classList.toggle('hidden');
      crimesList.classList.toggle('hidden');

      toggleBtn.firstElementChild.textContent = sideBar.classList.contains(
        'sidebar-collapsed'
      )
        ? 'arrow_right'
        : 'arrow_left';
    });
    // listener form añadir crimen
    formAddCrime.addEventListener('submit', this._newCrime.bind(this));
    // listener select categoria crimen
    selectCategoriaCrimen.addEventListener('change', (e: any) => {
      categoriaContainer.classList.add('hidden');
      tipoContainer.classList.remove('hidden');
      if (e.target.value === 'personal') {
        selectPersonalTipoCrimen.classList.remove('hidden');
      } else if (e.target.value === 'propiedad') {
        selectPropiedadTipoCrimen.classList.remove('hidden');
      }
    });
    // Ubicar mapa a un popup
    crimesList.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('crimes'));
    if (!data) return;
    this.#crimeList = data;
    this.#crimeList.forEach((crime) => {
      this._renderCrimeItem(crime);
    });
  }

  _setLocalStorage() {
    localStorage.setItem('crimes', JSON.stringify(this.#crimeList));
  }

  _capitalize(str: string): string {
    return str[0].toUpperCase() + str.slice(1);
  }
}

const app = new App();
