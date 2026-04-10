import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MapSelection } from '../../models/map';

@Component({
  selector: 'app-multiselect-info-window',
  templateUrl: './multiselect-info-window.component.html',
  styleUrl: './multiselect-info-window.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectInfoWindowComponent {
  selections: MapSelection[] = [];
}
