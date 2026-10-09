import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PollutionRecap } from './pollution-recap';

describe('PollutionRecap', () => {
  let component: PollutionRecap;
  let fixture: ComponentFixture<PollutionRecap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionRecap],
    }).compileComponents();

    fixture = TestBed.createComponent(PollutionRecap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
