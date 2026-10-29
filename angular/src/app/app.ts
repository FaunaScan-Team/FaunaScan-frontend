import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menu } from './components/menu/menu';
import { PiePagina } from './components/pie-pagina/pie-pagina';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menu, PiePagina],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
