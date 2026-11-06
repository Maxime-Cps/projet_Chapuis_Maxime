import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { UserList } from './user-list';
import { routes } from '../app.routes';
import { UserApi } from '../../services/user-api';
import { AuthSession } from '../../services/auth-session';
import { User } from '../../interfaces/User';

describe('UserList', () => {
  const ADA: User = { id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' };
  const ALAN: User = { id: 2, firstName: 'Alan', lastName: 'Turing', email: 'alan@example.com' };

  let api: { getAll: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    sessionStorage.clear();
    api = { getAll: vi.fn().mockReturnValue(of([ADA, ALAN])) };

    await TestBed.configureTestingModule({
      imports: [UserList],
      providers: [provideRouter(routes), { provide: UserApi, useValue: api }],
    }).compileComponents();

    TestBed.inject(AuthSession).start({ user: ALAN, token: 'signed-token' });
  });

  async function render(): Promise<ComponentFixture<UserList>> {
    const fixture = TestBed.createComponent(UserList);
    await fixture.whenStable();
    return fixture;
  }

  function labels(fixture: ComponentFixture<UserList>): string[] {
    const items = fixture.nativeElement.querySelectorAll('.item-label') as NodeListOf<HTMLElement>;
    return Array.from(items, (item) => item.textContent!.replace(/\s+/g, ' ').trim());
  }

  it('should show a loading state until the list arrives', async () => {
    const response = new Subject<User[]>();
    api.getAll.mockReturnValue(response);
    const fixture = await render();

    expect(fixture.nativeElement.querySelector('#users-loading')).not.toBeNull();

    response.next([ADA]);
    response.complete();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('#users-loading')).toBeNull();
  });

  it('should display every user and mark the signed-in one', async () => {
    const fixture = await render();

    expect(labels(fixture)).toEqual(['Ada Lovelace', 'Alan Turing Vous']);
  });

  it('should display an error when the list fails to load', async () => {
    api.getAll.mockReturnValue(throwError(() => new Error('down')));
    const fixture = await render();

    expect(fixture.nativeElement.querySelector('#users-error')?.textContent).toContain('utilisateurs');
    expect(fixture.nativeElement.querySelector('.list')).toBeNull();
  });
});
