import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { onMainContentChange } from './animations/animations';
import { AvailableLayouts, LayoutService } from './services/layout.service';
import { LoginService } from './services/login.service';
import { SidenavService } from './services/sidenav.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [onMainContentChange],
})
export class AppComponent implements OnDestroy {
  title = 'baustellenverwaltung';
  currentLayout: AvailableLayouts;
  loginState$: Observable<boolean>;
  loading: boolean;
  public onSideNavChange: boolean;
  subscriptions: Subscription[] = [];

  constructor(
    private sidenavService: SidenavService,
    private breakpointObserver: BreakpointObserver,
    private layoutService: LayoutService,
    private loginService: LoginService,
    private userService: UserService,
    private router: Router,
    translate: TranslateService
  ) {

    this.loading = false;
    this.sidenavService.sideNavState$.subscribe((res) => {
      this.onSideNavChange = res;
    });
    this.currentLayout = { layout: 'desktop' };
    this.subscriptions.push(
      this.breakpointObserver
        .observe([
          Breakpoints.XSmall,
          Breakpoints.Small,
          Breakpoints.Medium,
          Breakpoints.Large,
          Breakpoints.XLarge,
        ])
        .subscribe((result) => {
          if (result.breakpoints[Breakpoints.XSmall]) {
            // Extra small devices (portrait phones, less than 576px)
            this.currentLayout = { layout: 'phone' };
            this.layoutService.setLayout(this.currentLayout);
          }
          if (result.breakpoints[Breakpoints.Small]) {
            // Small devices (landscape phones, 576px and up)
            this.currentLayout = { layout: 'phone-landscape' };
            this.layoutService.setLayout(this.currentLayout);
          }
          if (result.breakpoints[Breakpoints.Medium]) {
            // Medium devices (tablets, 768px and up)
            this.currentLayout = { layout: 'tablet' };
            this.layoutService.setLayout(this.currentLayout);
          }
          if (result.breakpoints[Breakpoints.Large]) {
            // Large devices (desktops, 992px and up)
            this.currentLayout = { layout: 'desktop' };
            this.layoutService.setLayout(this.currentLayout);
          }
        })
    );
    this.loginState$ = this.loginService.loggedIn$;

    this.subscriptions.push(
      this.loginState$.subscribe((loginState) => {

        if (loginState) {
          this.loadProfile();
        }
      })
    );
    this.loadProfile();
    translate.setDefaultLang('de');
  }

  loadProfile() {
    this.loading = true;
    this.userService.getProfile().then((profile) => {

      if (profile && profile?.language) {
      }
      this.loading = false;
    }).catch((e) => {
      this.loading = false;
      console.log('Could not load Profile.');
    });

  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
