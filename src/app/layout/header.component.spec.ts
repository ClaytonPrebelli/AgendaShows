import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { provideRouter } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with menuOpen = false', () => {
    expect(component.menuOpen).toBeFalse();
  });

  it('should toggle menuOpen', () => {
    component.menuOpen = !component.menuOpen;
    expect(component.menuOpen).toBeTrue();
    component.menuOpen = !component.menuOpen;
    expect(component.menuOpen).toBeFalse();
  });

  it('should have logo text', () => {
    const logo = fixture.nativeElement.querySelector('.header__logo');
    expect(logo).toBeTruthy();
    expect(logo.textContent).toContain('Agenda');
    expect(logo.textContent).toContain('Clayton');
  });

  it('should render navigation links', () => {
    const links = fixture.nativeElement.querySelectorAll('.header__link');
    expect(links.length).toBe(2);
    expect(links[0].textContent).toContain('Dashboard');
    expect(links[1].textContent).toContain('Novo Show');
  });
});
