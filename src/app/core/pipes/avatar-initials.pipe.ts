import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avatarInitials',
  standalone: true
})
export class AvatarInitialsPipe implements PipeTransform {
  transform(name: string | undefined | null): string {
    if (!name) return 'User';
    return name.replace('Dr. ', '').replace(' ', '+');
  }
}
