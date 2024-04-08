import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AvailableLayouts, LayoutService } from 'src/app/services/layout.service';
import { SidenavService } from 'src/app/services/sidenav.service';
import { MatSidenav } from '@angular/material/sidenav';
import { onSideNavChange, animateText } from 'src/app/animations/animations';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  animations: [onSideNavChange, animateText]
})
export class NavbarComponent implements OnInit, OnDestroy {

  public sideNavState: boolean;
  public linkText: boolean;
  @Input() sidenav: MatSidenav;
  layout$: Observable<AvailableLayouts>;
  permissions: Promise<User>;
  currentViewport: AvailableLayouts;
  subscriptions: Subscription[] = [];

  constructor(
    private userService: UserService,
    private sidenavService: SidenavService,
    private layoutService: LayoutService) {}


  toggleSidenav() {
    if (this.currentViewport.layout === 'phone') {
      this.sidenav.close();
    } else {
      this.sidenavService.changeSideNavState(!this.sideNavState);
    }
  }
  ngOnInit() {
    this.layout$ = this.layoutService.getLayout();
    this.sideNavState = false;
    this.linkText = false;
    this.permissions = this.userService.getProfile();
    this.subscriptions.push(
    this.sidenavService.sideNavState$.subscribe(state => {
      this.sideNavState = state;
      setTimeout(() => {
        this.linkText = state;
      }, 200);
    }));
    this.subscriptions.push(
    this.layout$.subscribe((layout) => {
      this.currentViewport = layout;
    }));
  }

  closeSidenav() {
    if (this.currentViewport.layout === 'phone') {
      this.sidenav.close();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
