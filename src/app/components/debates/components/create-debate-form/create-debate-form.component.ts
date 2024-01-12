import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DebateHouses } from 'src/app/models/debate-houses';
import { DebatePositions } from 'src/app/models/debate-positions';
import { Debater } from 'src/app/models/debater';
import { Judge } from 'src/app/models/judge';
import { SelectOption } from 'src/app/models/select-option';
import { Society } from 'src/app/models/society';

@Component({
  selector: 'app-create-debate-form',
  templateUrl: './create-debate-form.component.html',
  styleUrls: ['./create-debate-form.component.scss']
})
export class CreateDebateFormComponent implements OnInit {
  public form: FormGroup;

  public timeOptions: SelectOption[] = [];

  public societyOptions: SelectOption[] = [];

  public maxDate: Date = new Date();

  public debaters: Debater[] = [];

  public filteredDebaters: Debater[] = [];

  public selectedDebaters: Debater[] = [];

  public judges: Judge[] = [];

  public judgeOptions: SelectOption[] = [];

  public uniqueSelectedDebaters: Debater[] = [];

  public selectedJudges: Judge[] = [];

  @ViewChildren('debatersLegendHouse')
  public debatersLegendHousesRefs: QueryList<ElementRef<HTMLDivElement>>;

  @ViewChildren('debater')
  public debatersRefs: QueryList<ElementRef<HTMLDivElement>>;

  get debateFormGroup() {
    return this.form.controls['debate'] as FormGroup;
  }

  get infoSlidesFormArray() {
    return this.debateFormGroup.controls['infoSlides'] as FormArray;
  }

  get debatersFormGroup() {
    return this.form.controls['debaters'] as FormGroup;
  }

  get debatersFormArray() {
    return this.debatersFormGroup.controls['debaters'] as FormArray;
  }

  get debatersFilterFormGroup() {
    return this.debatersFormGroup.controls['filters'] as FormGroup;
  }

  get spsFormArray() {
    return this.debatersFormGroup.controls['sps'] as FormArray;
  }

  get ironsFormArray() {
    return this.debatersFormGroup.controls['irons'] as FormArray;
  }

  get judgesFormGroup() {
    return this.form.controls['judges'] as FormGroup;
  }

  get wingsFormArray() {
    return this.judgesFormGroup.controls['wings'] as FormArray;
  }

  public ironSubscriptions: Subscription[] = [];

  public wingSubscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.initDebaters();
    this.initJudges();
    this.initOptions();
    this.subscribeToValueChanges();
  }

  public initForm() {
    this.form = this.formBuilder.group({
      debate: this.formBuilder.group({
        date: [new Date().toISOString(), Validators.required],
        time: [this.getCurrentClosestTime(), Validators.required],
        style: ['bp', Validators.required],
        local: ['virtual', Validators.required],
        motionType: ['', Validators.required],
        motionTheme: ['', Validators.required],
        motion: ['', Validators.required],
        infoSlides: this.formBuilder.array([])
      }),
      debaters: this.formBuilder.group({
        filters: this.formBuilder.group({
          name: [''],
          society: ['']
        }),
        debaters: this.formBuilder.array([]),
        sps: this.formBuilder.array([]),
        irons: this.formBuilder.array([])
      }),
      judges: this.formBuilder.group({
        chair: [''],
        wings: this.formBuilder.array([])
      })
    });
  }

  public initOptions() {
    for (let m = 0; m < 1440; m += 30) {
      this.timeOptions.push(
        {
          value: `${Math.floor(m/60).toString().padStart(2, '0')}:${(m%60).toString().padStart(2, '0')}`,
          viewValue: `${Math.floor(m/60).toString().padStart(2, '0')}:${(m%60).toString().padStart(2, '0')}`
        }
      )
    }

    const society = Object.entries(Society);

    this.societyOptions = society.map(([value, viewValue]) => ({ value, viewValue }))
      .sort((a, b) => a.viewValue.toLowerCase().localeCompare(b.viewValue.toLowerCase()));
  }

  public initDebaters() {
    this.debaters = [
      {
        id: '2',
        name: 'Camila Caleones',
        society: 'sdufrj'
      },
      {
        id: '3',
        name: 'Dylhermanno dos Reis',
        society: 'hermeneutica'
      },
      {
        id: '4',
        name: 'Bruno Visnadi',
        society: 'senatus'
      },
      {
        id: '5',
        name: 'Caio Castro',
        society: 'uspd'
      },
      {
        id: '6',
        name: 'Jéssica Peixoto',
        society: 'uspd'
      },
      {
        id: '7',
        name: 'Vinícius Brasileiro',
        society: 'sdufrj'
      },
      {
        id: '8',
        name: 'Isabella Refkalefsky',
        society: 'sdufrj'
      },
      {
        id: '9',
        name: 'Larissa dos Anjos',
        society: 'hermeneutica'
      },
      {
        id: '10',
        name: 'Matheus Beninca',
        society: 'gdo'
      },
      {
        id: '11',
        name: 'Cali Peixoto',
        society: 'gdo'
      },
      {
        id: '12',
        name: 'Raphael Dias',
        society: 'sdufrj'
      },
      {
        id: '13',
        name: 'João Miranda',
        society: 'sdufrj'
      },
      {
        id: '14',
        name: 'Cecília Antunes',
        society: 'sdufrj'
      },
      {
        id: '15',
        name: 'Luís Otávio',
        society: 'sdufrj'
      },
      {
        id: '16',
        name: 'Isabella Romanholi',
        society: 'sdufrj'
      },
      {
        id: '17',
        name: 'Carol Damascena',
        society: 'sdufrj'
      },
      {
        id: '18',
        name: 'Rafaela Popov',
        society: 'sdufrj'
      },
    ].sort((a, b) => a.name.localeCompare(b.name));

    this.filteredDebaters = this.debaters;

    this.initDebatersFormArray();
  }

  public initJudges() {
    this.judges = [
      {
        id: '1',
        name: 'Luan Martins',
        society: 'sdufrj'
      },
      {
        id: '2',
        name: 'Camila Caleones',
        society: 'sdufrj'
      },
      {
        id: '3',
        name: 'Dylhermanno dos Reis',
        society: 'hermeneutica'
      },
      {
        id: '4',
        name: 'Maria Marchesan',
        society: 'gdo'
      },
      {
        id: '6',
        name: 'Jéssica Peixoto',
        society: 'uspd'
      },
      {
        id: '7',
        name: 'Vinícius Brasileiro',
        society: 'sdufrj'
      },
      {
        id: '8',
        name: 'Isabella Refkalefsky',
        society: 'sdufrj'
      },
      {
        id: '9',
        name: 'Larissa dos Anjos',
        society: 'hermeneutica'
      },
      {
        id: '10',
        name: 'Matheus Beninca',
        society: 'gdo'
      },
      {
        id: '11',
        name: 'Cali Peixoto',
        society: 'gdo'
      },
      {
        id: '12',
        name: 'Raphael Dias',
        society: 'sdufrj'
      }
    ].sort((a, b) => a.name.localeCompare(b.name));

    this.initJudgeOptions();
  }

  public initJudgeOptions() {
    this.judgeOptions = this.judges.map((judge: Judge) => ({
      value: judge.id,
      viewValue: judge.name
    }));
  }

  public initDebatersFormArray() {
    this.debaters.forEach(() => {
      this.debatersFormArray.push(this.formBuilder.control(false));
    });
  }

  public subscribeToValueChanges() {
    this.debatersFilterFormGroup.controls['name'].valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.debatersFilterFormGroup.controls['society'].valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.debatersFormArray.controls.forEach((control, index) =>
      control.valueChanges.subscribe((selected: boolean) => {
        if (selected) {
          this.selectedDebaters.push(this.debaters[index]);
          this.spsFormArray.push(
            this.formBuilder.control('', [Validators.min(50), Validators.max(100)])
          );

          this.uniqueSelectedDebaters.push(this.debaters[index]);
          this.ironsFormArray.push(this.formBuilder.control(false));
        } else {
          const selectedDebaterIndex = this.selectedDebaters.findIndex((debater: Debater) =>
            debater.id === this.debaters[index].id
          );
          this.selectedDebaters.splice(selectedDebaterIndex, 1);
          this.spsFormArray.removeAt(selectedDebaterIndex);

          const uniqueSelectedDebaterIndex = this.uniqueSelectedDebaters.findIndex((debater: Debater) =>
            debater.id === this.debaters[index].id
          );

          if (this.ironsFormArray.controls[uniqueSelectedDebaterIndex].value) {
            const selectedDebaterIndex = this.selectedDebaters.findIndex((debater: Debater) =>
              debater.id === this.debaters[index].id
            );
            this.selectedDebaters.splice(selectedDebaterIndex, 1);
            this.spsFormArray.removeAt(selectedDebaterIndex);
          }

          this.uniqueSelectedDebaters.splice(uniqueSelectedDebaterIndex, 1);
          this.ironsFormArray.removeAt(uniqueSelectedDebaterIndex);
        }

        this.ironSubscriptions.forEach((subscription) => subscription.unsubscribe());
        this.ironSubscriptions = this.ironsFormArray.controls.map((control, ironsFormArrayIndex) =>
          control.valueChanges.subscribe((ironSelected: boolean) => {
            const ironDebater = this.uniqueSelectedDebaters[ironsFormArrayIndex];
            if (ironSelected) {
              this.selectedDebaters.push(ironDebater);
              this.spsFormArray.push(
                this.formBuilder.control('', [Validators.min(50), Validators.max(100)])
              );
            } else {
              const ironDebaterIndex = this.selectedDebaters.lastIndexOf(ironDebater);
              this.selectedDebaters.splice(ironDebaterIndex, 1);
              this.spsFormArray.removeAt(ironDebaterIndex);
            }

            this.checkIronsCheckboxDisable();
            this.checkDebatersCheckboxDisable();
          })
        )

        this.checkIronsCheckboxDisable();
        this.checkDebatersCheckboxDisable();
      })
    );

    this.judgesFormGroup.valueChanges.subscribe(() => {
      this.selectedJudges = [];

      this.selectedJudges.push(this.getJudgeById(this.judgesFormGroup.controls['chair'].value));
      this.wingsFormArray.controls.forEach((control) => this.selectedJudges.push(
        this.getJudgeById(control.value)
      ));

      this.initJudgeOptions();

      this.selectedJudges.forEach((selectedJudge) => {
        const index = this.judgeOptions.findIndex((judge) => judge.value === selectedJudge.id);
        this.judgeOptions[index].disabled = true;
      });
    });
  }

  public getFilteredDebaterIndex(index: number) {
    return this.debaters.findIndex((debater) => debater.id === this.filteredDebaters[index].id);
  }

  public checkDebatersCheckboxDisable() {
    this.debatersFormArray.controls.forEach((control) => {
      if (this.selectedDebaters.length === 8 && !control.value) control.disable({ emitEvent: false });
      else control.enable({ emitEvent: false });
    });
  }

  public checkIronsCheckboxDisable() {
    this.ironsFormArray.controls.forEach((control) => {
      if (this.selectedDebaters.length === 8 && !control.value) control.disable({ emitEvent: false });
      else control.enable({ emitEvent: false });
    });
  }

  public applyFilters() {
    this.filteredDebaters = this.debaters;

    if (this.debatersFilterFormGroup.controls['name'].value) {
      const filter = this.debatersFilterFormGroup.controls['name'].value;
      this.filteredDebaters = this.filteredDebaters.filter((debater: Debater) => debater.name.toLowerCase().match(filter.toLowerCase()))
    }

    if (this.debatersFilterFormGroup.controls['society'].value) {
      const filter = this.debatersFilterFormGroup.controls['society'].value;
      this.filteredDebaters = this.filteredDebaters.filter((debater: Debater) => debater.society === filter)
    }
  }

  public getCurrentClosestTime() {
    let hour = new Date().getHours() - 2;
    let minutes = new Date().getMinutes();

    hour = (minutes >= 45) ? hour+1 : hour;
    minutes = (minutes <= 15 || minutes >= 45) ? 0 : 30;

    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  public canAddInfoSlide() {
    return this.form.controls['debate'].value['infoSlides'].length < 2;
  }

  public addInfoSlide() {
    this.infoSlidesFormArray.push(this.formBuilder.control(''));
  }

  public addWing() {
    this.wingsFormArray.push(this.formBuilder.control(''));
  }

  public removeInfoSlide(index: number) {
    this.infoSlidesFormArray.removeAt(index);
  }

  public removeWing(index: number) {
    this.wingsFormArray.removeAt(index);
  }

  public showInfoSlideDeleteIcon(index: number) {
    return index === this.infoSlidesFormArray.controls.length-1;
  }

  public dropDebater(event: CdkDragDrop<Debater[]>) {
    moveItemInArray(this.selectedDebaters, event.previousIndex, event.currentIndex);

    const spsFormArray = this.spsFormArray.value;
    moveItemInArray(spsFormArray, event.previousIndex, event.currentIndex);
    this.spsFormArray.patchValue(spsFormArray);
  }

  public getDebatePositionByIndex(index: number) {
    switch(index) {
      case 0:
        return DebatePositions.pm;
      case 1:
        return DebatePositions.lo;
      case 2:
        return DebatePositions.dpm;
      case 3:
        return DebatePositions.dlo;
      case 4:
        return DebatePositions.mg;
      case 5:
        return DebatePositions.mo;
      case 6:
        return DebatePositions.gw;
      case 7:
        return DebatePositions.ow;
    }

    return '';
  }

  public getDebaterBackgroundColor(index: number) {
    switch (index) {
      case 0:
      case 2:
        return 'lime';
      case 1:
      case 3:
        return 'teal';
      case 4:
      case 6:
        return 'blue';
      case 5:
      case 7:
        return 'purple';
    }

    return ''
  }

  public getDebateHouses() {
    return Object.values(DebateHouses);
  }

  public getHouseBackgroundColor(house: DebateHouses) {
    switch(house) {
      case DebateHouses.og:
        return 'lime';
      case DebateHouses.oo:
        return 'teal';
      case DebateHouses.cg:
        return 'blue';
      case DebateHouses.co:
        return 'purple';
    }
  }

  public debatersLegendMouseEnter(index: number) {
    this.debatersLegendHousesRefs.toArray().forEach((ref, i) => {
      if (index === i) {
        ref.nativeElement.classList.add('debates__form__stepper__step__debaters__houses__legend--focus');
      } else {
        ref.nativeElement.classList.add('debates__form__stepper__step__debaters__houses__legend--blur');
      }
    });

    this.debatersRefs.forEach((ref, i) => {
      if (
        (index === 0 && (i === 0 || i === 2)) ||
        (index === 1 && (i === 1 || i === 3)) ||
        (index === 2 && (i === 4 || i === 6)) ||
        (index === 3 && (i === 5 || i === 7))
      )
        ref.nativeElement.classList.add(
          'debates__form__stepper__step__debaters__positions__debater--focus'
        );
      else
        ref.nativeElement.classList.add(
          'debates__form__stepper__step__debaters__positions__debater--blur'
        );
    });
  }

  public debatersLegendMouseLeave(index: number) {
    this.debatersLegendHousesRefs.toArray().forEach((ref, i) => {
      if (index === i) {
        ref.nativeElement.classList.remove('debates__form__stepper__step__debaters__houses__legend--focus');
      } else {
        ref.nativeElement.classList.remove('debates__form__stepper__step__debaters__houses__legend--blur');
      }
    });

    this.debatersRefs.forEach((ref, i) => {
      if (
        (index === 0 && (i === 0 || i === 2)) ||
        (index === 1 && (i === 1 || i === 3)) ||
        (index === 2 && (i === 4 || i === 6)) ||
        (index === 3 && (i === 5 || i === 7))
      )
        ref.nativeElement.classList.remove(
          'debates__form__stepper__step__debaters__positions__debater--focus'
        );
      else
        ref.nativeElement.classList.remove(
          'debates__form__stepper__step__debaters__positions__debater--blur'
        );
    });
  }

  public removeDebatersNameFilter() {
    this.debatersFilterFormGroup.controls['name'].patchValue('');
  }

  public showRemoveDebatersNameFilterIcon() {
    return this.debatersFilterFormGroup.controls['name'].value;
  }

  public removeDebatersSocietyFilter(event: Event) {
    event.stopPropagation();
    this.debatersFilterFormGroup.controls['society'].patchValue('');
  }

  public showRemoveDebatersSocietyFilterIcon() {
    return this.debatersFilterFormGroup.controls['society'].value;
  }

  public showIrons() {
    return this.selectedDebaters.length &&
      (this.selectedDebaters.length < 8 ||
        (this.selectedDebaters.length === 8 && this.ironsFormArray.controls.reduce((prev, curr) => prev + curr.value ? 1 : 0, 0)));
  }

  public getJudgeById(judgeId: string) {
    return this.judges.find((judge) => judge.id === judgeId)!;
  }
}
