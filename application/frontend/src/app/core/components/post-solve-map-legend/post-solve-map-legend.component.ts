import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { MapLayer, MapLayerId } from '../../models/map';

@Component({
  selector: 'app-post-solve-map-legend',
  templateUrl: './post-solve-map-legend.component.html',
  styleUrls: ['./post-solve-map-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostSolveMapLegendComponent {
  @Input() mapLayers: { [id: string]: MapLayer } = {};
  @Output() setLayerVisibility = new EventEmitter<{ layerId: MapLayerId; visible: boolean }>();
  @HostBinding('class.app-map-panel') readonly mapPanel = true;

  objectKeys = Object.keys;
}
