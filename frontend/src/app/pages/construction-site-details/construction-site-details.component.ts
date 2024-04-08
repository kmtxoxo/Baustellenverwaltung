import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConstructionSite } from 'src/app/models/constructionSite';
import { User } from 'src/app/models/user';
import { ConstructionSiteService } from 'src/app/services/construction-site.service';
import { NoteService } from 'src/app/services/note.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-construction-site-details',
  templateUrl: './construction-site-details.component.html',
  styleUrls: ['./construction-site-details.component.scss'],
})
export class ConstructionSiteDetailsComponent implements OnInit, OnDestroy {
  constructionSite: ConstructionSite;
  subscriptions: Subscription[] = [];
  loading = true;
  permissions: Promise<User>;
  notificationCount: number;
  constructor(
    private readonly constructionSiteService: ConstructionSiteService,
    private noteService: NoteService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.notificationCount = 0;
    this.loading = true;
    this.permissions = this.userService.getProfile();
    this.subscriptions.push(
      this.route.paramMap.subscribe((params) => {
        const baustellenId = params.get('id');
        this.constructionSiteService
          .getConstructionSiteById(baustellenId)
          .then((data) => {
            this.constructionSite = data;
            this.loading = false;
          })
          .catch((data) => {
            this.loading = false;
            this.constructionSite = null;
          });
        this.noteService.getConstructionSiteNote(parseInt(baustellenId, 10))
          .then((data) => {
            this.notificationCount = data.length;
        }).catch((e) => {
            console.log('error');
            console.log(e);
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
