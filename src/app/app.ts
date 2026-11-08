import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';

type Spark = {
  id: number;
  x: number;
  y: number;
  hue: 'gold' | 'amber';
  size: number;
  delay: number;
};

type CrackerType = 'aerial' | 'fountain' | 'rocket' | 'chakra';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnDestroy {
  protected readonly diyas = Array.from({ length: 7 }, (_, index) => index);
  protected readonly litDiyas = signal<Set<number>>(new Set());
  protected readonly sparks = signal<Spark[]>([]);
  protected readonly introVisible = signal(true);
  protected readonly musicOn = signal(false);
  protected readonly isReducedMotion = signal(false);
  protected readonly selectedCracker = signal<CrackerType>('aerial');
  protected readonly crackerOptions: { type: CrackerType; label: string; icon: string }[] = [
    { type: 'aerial', label: 'Aerial burst', icon: '✦' },
    { type: 'fountain', label: 'Flower pot', icon: '✧' },
    { type: 'rocket', label: 'Rocket', icon: '↑' },
    { type: 'chakra', label: 'Chakra', icon: '◌' },
  ];

  private sparkId = 0;
  constructor() {
    this.isReducedMotion.set(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  protected enterCelebration(): void {
    this.introVisible.set(false);
    document.body.classList.add('celebration-entered');
  }

  protected lightDiya(index: number): void {
    const next = new Set(this.litDiyas());
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
      this.createSparks(5, index);
    }
    this.litDiyas.set(next);
  }

  protected lightAll(): void {
    const next = new Set(this.diyas);
    this.litDiyas.set(next);
    this.createSparks(22);
  }

  protected chooseCracker(type: CrackerType): void {
    this.selectedCracker.set(type);
  }

  protected celebrate(type: CrackerType = this.selectedCracker()): void {
    const burstCount = type === 'fountain' ? 4 : type === 'rocket' ? 5 : this.isReducedMotion() ? 3 : 7;
    for (let index = 0; index < burstCount; index += 1) {
      window.setTimeout(() => this.createCrackerSparks(type), index * (type === 'rocket' ? 320 : 240));
    }
  }

  private createCrackerSparks(type: CrackerType): void {
    const count = this.isReducedMotion() ? 8 : type === 'fountain' ? 18 : type === 'chakra' ? 16 : 24;
    const y = type === 'fountain' ? 58 + Math.random() * 22 : type === 'rocket' ? 12 + Math.random() * 30 : 18 + Math.random() * 50;
    this.createSparks(count, undefined, y);
  }

  protected toggleMusic(): void {
    if (this.musicOn()) {
      this.musicOn.set(false);
      this.sendYouTubeCommand('pauseVideo');
    } else {
      this.musicOn.set(true);
      this.sendYouTubeCommand('playVideo');
    }
  }

  private sendYouTubeCommand(func: 'playVideo' | 'pauseVideo'): void {
    const player = document.querySelector<HTMLIFrameElement>('#diwali-song');
    player?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
  }

  private createSparks(count: number, diyaIndex?: number, fixedY?: number): void {
    const created = Array.from({ length: count }, () => ({
      id: this.sparkId++,
      x: diyaIndex === undefined ? 10 + Math.random() * 80 : 24 + diyaIndex * 8 + Math.random() * 5,
      y: fixedY ?? (diyaIndex === undefined ? 20 + Math.random() * 48 : 65 + Math.random() * 10),
      hue: Math.random() > 0.3 ? 'gold' as const : 'amber' as const,
      size: 2 + Math.random() * 5,
      delay: Math.random() * 0.4,
    }));
    this.sparks.update((sparks) => [...sparks, ...created]);
    window.setTimeout(() => {
      const ids = new Set(created.map((spark) => spark.id));
      this.sparks.update((sparks) => sparks.filter((spark) => !ids.has(spark.id)));
    }, this.isReducedMotion() ? 700 : 2300);
  }

  ngOnDestroy(): void {
    this.sendYouTubeCommand('pauseVideo');
  }
}
