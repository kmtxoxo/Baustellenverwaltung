import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { AvailableLayouts, LayoutService } from 'src/app/services/layout.service';
import { LoginService } from 'src/app/services/login.service';
import { SidenavService } from 'src/app/services/sidenav.service';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  @Input() sidenav: MatSidenav;
  public sideNavState: boolean;
  currentLayout: AvailableLayouts;
  currentRoute: string;
  profile: User;
  subscriptions: Subscription[] = [];

  constructor(
    private sidenavService: SidenavService,
    private layoutService: LayoutService,
    private loginService: LoginService,
    private router: Router,
    private userService: UserService,
    private translate: TranslateService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.sideNavState = false;
    this.subscriptions.push(
    this.layoutService.getLayout().subscribe((currentDevice: AvailableLayouts) => {
      this.currentLayout = currentDevice;
      if (currentDevice.layout !== 'phone') {
        this.sidenavService.changeSideNavState(false);
      }
    }));
    this.subscriptions.push(
    this.sidenavService.sideNavState$.subscribe((state) => {
      this.sideNavState = state;
    }));
    this.userService.getProfile().then((profile) => {
      this.profile = profile;
    });

    this.determeRoute(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    )
      .subscribe( (event: any) => {
          this.determeRoute(event.url);
      });
  }

  toggleSidenav() {
    if (this.currentLayout.layout === 'phone') {
      this.sidenav.toggle();
      this.sidenavService.changeSideNavState(true);
    } else {
      this.sidenavService.changeSideNavState(false);
    }
  }

  determeRoute(route: string) {
    switch (route) {
      case '/notifications': this.currentRoute = 'routes.notifications'; break;
      case '/constructionSites': this.currentRoute = 'routes.construction'; break;
      case '/tasks': this.currentRoute = 'routes.tasks'; break;
      case '/users': this.currentRoute = 'routes.employee'; break;
      case '/settings': this.currentRoute = 'routes.settings'; break;
      default: this.currentRoute = '';
    }
  }
  logout() {
    this.loginService.logout().then(() => {
      this.translate.get('snackbar.successfully_logged_out').subscribe((message) => {
        this.snackBar.open(message, 'X', {
          duration: 2000,
        });
      });
    }).catch((e) => {
      this.translate.get('snackbar.failed_to_logout').subscribe((message) => {
        this.snackBar.open(message, 'X', {
          duration: 2000,
        });
      });
      console.log(e);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
