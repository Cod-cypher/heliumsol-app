import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, Inject, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // 👈 add this

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  email = '';
  isSending = false;
  formStatus: 'idle' | 'success' | 'error' = 'idle';
  formMessage = "Enter your email and we'll be in touch.";
  revealed: boolean[] = Array(8).fill(false);
  isBrowser = false;

  private ctx!: CanvasRenderingContext2D;
  private animFrameId!: number;
  private particles: any[] = [];
  private W = 0;
  private H = 0;
  private resizeListener!: () => void;

  // 👇 type changed to SafeHtml
  services: { id: string; title: string; desc: string; tag: string; wide: boolean; icon: SafeHtml }[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private sanitizer: DomSanitizer // 👈 inject sanitizer
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // 👇 build services here so sanitizer is available
    this.services = [
      {
        id: 'chatbot',
        title: 'AI Chatbot',
        desc: 'Custom conversational AI trained on your business data — handles support, sales & lead capture 24/7.',
        tag: 'GPT-4 Powered',
        wide: false,
        icon: this.sanitizer.bypassSecurityTrustHtml(`
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="26" height="18" rx="3"/>
            <path d="M10 28l6-6 6 6"/>
            <circle cx="11" cy="13" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="21" cy="13" r="1.5" fill="currentColor" stroke="none"/>
            <path d="M13 17.5c.8.9 5.2.9 6 0"/>
          </svg>`)
      },
      {
        id: 'biz-seo',
        title: 'Business SEO',
        desc: 'AI-driven local & national SEO — keyword research, content strategy and rank tracking for your brand.',
        tag: 'AI Optimized',
        wide: false,
        icon: this.sanitizer.bypassSecurityTrustHtml(`
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="14" cy="14" r="9"/>
            <path d="M23 23l6 6"/>
            <path d="M10 14h8M14 10v8"/>
          </svg>`)
      },
      {
        id: 'web-seo',
        title: 'Website SEO',
        desc: 'Technical audits, on-page fixes, Core Web Vitals and schema markup — your site climbing search results fast.',
        tag: 'Technical + Content',
        wide: false,
        icon: this.sanitizer.bypassSecurityTrustHtml(`
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="6" width="26" height="20" rx="2"/>
            <path d="M3 11h26"/>
            <circle cx="7" cy="8.5" r="0.8" fill="currentColor" stroke="none"/>
            <circle cx="10.5" cy="8.5" r="0.8" fill="currentColor" stroke="none"/>
            <path d="M9 17l4 4 9-8"/>
          </svg>`)
      },
      {
        id: 'fullstack',
        title: 'Full-Stack App Development',
        desc: 'From concept to deployment — we architect and build scalable web & mobile applications with modern stacks: React, Node, Python, cloud-native infrastructure, and AI integrations baked in from day one.',
        tag: 'React · Node · Python · Cloud',
        wide: true,
        icon: this.sanitizer.bypassSecurityTrustHtml(`
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="8 10 3 16 8 22"/>
            <polyline points="24 10 29 16 24 22"/>
            <line x1="18" y1="6" x2="14" y2="26"/>
          </svg>`)
      }
    ];
  }

  ngOnInit(): void {
    // Keep all content visible
    this.revealed = Array(8).fill(true);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initParticles();
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      cancelAnimationFrame(this.animFrameId);
      window.removeEventListener('resize', this.resizeListener);
    }
  }



  private initParticles(): void {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;
    this.ctx = context;
    this.resizeListener = () => this.resize(canvas);
    window.addEventListener('resize', this.resizeListener);
    this.resize(canvas);
    for (let i = 0; i < 55; i++) this.particles.push(this.spawnParticle());
    this.drawParticles();
  }

  private resize(canvas: HTMLCanvasElement): void {
    this.W = canvas.width = window.innerWidth;
    this.H = canvas.height = window.innerHeight;
  }

  private spawnParticle(): any {
    return {
      x: Math.random() * this.W,
      y: Math.random() * this.H,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(Math.random() * 0.25 + 0.08),
      a: Math.random() * 0.5 + 0.1,
      life: 0,
      maxLife: Math.random() * 280 + 120,
    };
  }

  private drawParticles(): void {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    this.particles.forEach((p, i) => {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      const alpha = p.a * Math.sin(Math.PI * (p.life / p.maxLife));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,192,96,${alpha})`;
      ctx.fill();
      if (p.life >= p.maxLife) this.particles[i] = this.spawnParticle();
    });
    this.animFrameId = requestAnimationFrame(() => this.drawParticles());
  }

  onSubmit(): void {
    if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.formStatus = 'error';
      this.formMessage = 'Please enter a valid email address.';
      return;
    }
    this.isSending = true;
    if (this.isBrowser) {
      setTimeout(() => {
        this.isSending = false;
        this.formStatus = 'success';
        this.formMessage = "✦ Thank you! We'll be in touch soon.";
        this.email = '';
      }, 900);
    }
  }
}