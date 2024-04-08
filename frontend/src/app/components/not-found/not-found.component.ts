import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/services/layout.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor(private router: Router, private layoutService: LayoutService) { }

  ngOnInit(): void {
  }

  goBack() {
    this.router.navigate(['/notifications']);
  }

}
