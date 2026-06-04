import { Component } from '@angular/core';
import { CustomerHeader } from "./customer-header/customer-header";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-customer-layout',
  imports: [CustomerHeader, RouterOutlet],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.scss',
})
export class CustomerLayout {

}
