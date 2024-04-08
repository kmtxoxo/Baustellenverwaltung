import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timestamp'
})
export class TimestampPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    const seconds = Math.floor((new Date().getTime() - new Date(value).getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
      return interval + (interval === 1 ? 'Jahr' : ' Jahre');
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + (interval === 1 ? 'Monat' : ' Monate');
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + (interval === 1 ? 'Tag' : ' Tage');
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + (interval === 1 ? 'Stunde' : ' Stunden');
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + (interval === 1 ? 'Minute' : ' Minuten');
    }
    return 'vor wenigen Sekunden';
  }

}
