import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-suggestion-chips',
  standalone: true,
  templateUrl: './suggestion-chips.html',
  styleUrl: './suggestion-chips.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class SuggestionChipsComponent {
  suggestions = input.required<string[]>();

  suggestionClicked = output<string>();
}
