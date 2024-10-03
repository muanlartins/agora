import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DebateHouse } from 'src/app/models/enums/debate-house';
import { DebatePosition } from 'src/app/models/enums/debate-position';
import { DebateStyle } from 'src/app/models/enums/debate-style';
import { DebateVenue } from 'src/app/models/enums/debate-venue';
import { SelectOption } from 'src/app/models/types/select-option';
import { Member } from 'src/app/models/types/member';
import { MemberService } from 'src/app/services/member.service';
import { DebateService } from 'src/app/services/debate.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Debate } from 'src/app/models/types/debate';
import * as removeAccents from 'remove-accents';
import { getState, setState } from 'src/app/utils/state';
import { ConfirmModalComponent } from 'src/app/components/members/components/confirm-modal/confirm-modal.component';
import { CreateDebateModalComponent } from '../create-debate-modal/create-debate-modal.component';

@Component({
  selector: 'app-create-debate-form',
  templateUrl: './create-debate-form.component.html',
  styleUrls: ['./create-debate-form.component.scss']
})
export class CreateDebateFormComponent implements OnInit, AfterViewInit {
  @Input()
  public isEditing: boolean;

  @Input()
  public debate: Debate;

  public form: FormGroup;

  public timeOptions: SelectOption[] = [];

  public tournamentOptions: SelectOption[] = [];

  public motionTypeOptions: SelectOption[] = [];

  public motionThemeOptions: SelectOption[] = [];

  public societyOptions: SelectOption[] = [];

  public maxDate: Date = new Date();

  public debaters: Member[] = [];

  public members: Member[] = [];

  public filteredDebaters: Member[] = [];

  public selectedDebaters: Member[] = [];

  public uniqueSelectedDebaters: Member[] = [];

  public judges: Member[] = [];

  public selectedJudges: Member[] = [];

  public judgeOptions: SelectOption[] = [];

  public filteredJudgeOptions: SelectOption[] = [];

  public debateHouses: [key: string, value: DebateHouse][] = Object.entries(DebateHouse);

  public callHouses: [key: string, value: DebateHouse][] = [];

  @ViewChildren('debatersLegendHouse')
  public debatersLegendHousesRefs: QueryList<ElementRef<HTMLDivElement>>;

  @ViewChildren('debater')
  public debatersRefs: QueryList<ElementRef<HTMLDivElement>>;

  @ViewChildren('call')
  public housesRefs: QueryList<ElementRef<HTMLDivElement>>;

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

  public spSubscriptions: Subscription[] = [];

  get debatePosition() {
    return DebatePosition;
  }

  get debateStyle() {
    return DebateStyle;
  }

  get debateVenue() {
    return DebateVenue;
  }

  constructor(
    private formBuilder: FormBuilder,
    private memberService: MemberService,
    private debateService: DebateService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CreateDebateModalComponent>,
    private cdr: ChangeDetectorRef
  ) { }

  public ngOnInit(): void {
    this.initForm();
    this.initOptions();
    this.getAllMembers();
  }

  public ngAfterViewInit(): void {
    this.checkIsEditing();
    this.checkDebatersCheckboxDisable();
    this.checkIronsCheckboxDisable();
    this.cdr.detectChanges();
  }

  public initForm() {
    this.form = this.formBuilder.group({
      debate: this.formBuilder.group({
        date: [new Date().toISOString(), Validators.required],
        time: [this.getCurrentClosestTime(), Validators.required],
        style: ['bp', Validators.required],
        venue: ['remote', Validators.required],
        motionType: ['', Validators.required],
        newMotionType: [''],
        motionTheme: ['', Validators.required],
        newMotionTheme: [''],
        motion: ['', Validators.required],
        infoSlides: this.formBuilder.array([]),
        tournament: ['Interno', Validators.required],
        newTournament: [''],
      }),
      debaters: this.formBuilder.group({
        filters: this.formBuilder.group({
          name: [''],
          society: [''],
          isTrainee: [false]
        }),
        debaters: this.formBuilder.array([]),
        sps: this.formBuilder.array([]),
        irons: this.formBuilder.array([])
      }),
      judges: this.formBuilder.group({
        chair: [''],
        wings: this.formBuilder.array([]),
        filter: ['']
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

    this.debateService.getAllDebates().subscribe((debates: Debate[]) => {
      this.tournamentOptions = [...new Set(['Interno', ...debates.map((debate) => debate.tournament)]), 'Nova Ocasião']
      .filter((tournament): tournament is string => tournament !== null)
      .map((tournament) => ({
          value: tournament,
          viewValue: tournament
      })).sort((a, b) => {
        if (a.value === 'Interno') return -1;
        if (b.value === 'Nova Ocasião') return 1;
        if (!a.value || !b.value) return 0;

        return a.value.toLowerCase().localeCompare(b.value.toLowerCase())
      });

      this.motionTypeOptions = [...new Set(debates.map((debate) => debate.motionType))]
        .filter((motionType) => motionType !== null)
        .map((motionType) => ({
          value: motionType,
          viewValue: motionType
        })).sort((a, b) => {
          if (b.value === 'Novo Tipo') return 1;

          return a.value.toLowerCase().localeCompare(b.value.toLowerCase())
        });

      this.motionThemeOptions = [...new Set(debates.map((debate) => debate.motionTheme))]
        .filter((motionTheme) => motionTheme !== null)
        .map((motionTheme) => ({
          value: motionTheme,
          viewValue: motionTheme
        })).sort((a, b) => {
          if (b.value === 'Novo Tema') return 1;

          return a.value.toLowerCase().localeCompare(b.value.toLowerCase())
        });
    });


  }

  public getAllMembers() {
    this.memberService.getAllMembers().subscribe((members) => {
      this.debaters = members.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
      this.members = members.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
      this.judges = members.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

      this.initDebaters();
      this.initJudgeOptions();
      this.initSocietyOptions();
      this.subscribeToValueChanges();
    });
  }

  public initDebaters() {
    this.filteredDebaters = this.debaters;

    this.initDebatersFormArray();
  }

  public initDebatersFormArray() {
    this.debatersFormArray.patchValue([]);

    const state = getState();

    this.debaters.forEach((debater) => {
      if (
        (
          this.isEditing &&
          this.debate.debaters &&
          this.debate.debaters.find((d) => d.id === debater.id)
        )
        ||
        (
          !this.isEditing &&
          state['debate'] &&
          state['debate'].debaters &&
          state['debate'].debaters.find((d: any) => d.id === debater.id)
        )
      )
        this.debatersFormArray.push(this.formBuilder.control(true));
      else this.debatersFormArray.push(this.formBuilder.control(false));
    });
  }

  public initJudgeOptions() {
    this.judgeOptions = this.judges.map((judge: Member) => ({
      value: judge.id,
      viewValue: judge.name,
      disabled: false
    }));

    this.filteredJudgeOptions = this.judgeOptions;
  }

  public initSocietyOptions() {
    this.societyOptions = [...new Set(this.members.map((member) => member.society))].map((society: string) => ({
      value: society,
      viewValue: society
    })).sort((a, b) => a.viewValue.toLowerCase().localeCompare(b.viewValue.toLowerCase()));
  }

  public filterJudgeOptions(filter?: string) {
    if (filter) {
      this.filteredJudgeOptions = this.judgeOptions
        .filter((judge) => removeAccents(judge.viewValue.toLowerCase()).includes(removeAccents(filter.toLowerCase())));
    } else this.filteredJudgeOptions = this.judgeOptions;

    this.selectedJudges.forEach((selectedJudge) => {
      const filteredIndex = this.filteredJudgeOptions.findIndex((judge) => judge.value === selectedJudge.id);
      if (filteredIndex !== -1) this.filteredJudgeOptions[filteredIndex].disabled = true;
    });
  }

  public subscribeToValueChanges() {
    this.debatersFilterFormGroup.controls['name'].valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.debatersFilterFormGroup.controls['society'].valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.debatersFilterFormGroup.controls['isTrainee'].valueChanges.subscribe(() => {
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
          const selectedDebaterIndex = this.selectedDebaters.findIndex((debater: Member) =>
            debater.id === this.debaters[index].id
          );
          this.selectedDebaters.splice(selectedDebaterIndex, 1);
          this.spsFormArray.removeAt(selectedDebaterIndex);

          const uniqueSelectedDebaterIndex = this.uniqueSelectedDebaters.findIndex((debater: Member) =>
            debater.id === this.debaters[index].id
          );

          if (this.ironsFormArray.controls[uniqueSelectedDebaterIndex].value) {
            const selectedDebaterIndex = this.selectedDebaters.findIndex((debater: Member) =>
              debater.id === this.debaters[index].id
            );
            this.selectedDebaters.splice(selectedDebaterIndex, 1);
            this.spsFormArray.removeAt(selectedDebaterIndex);
          }

          this.uniqueSelectedDebaters.splice(uniqueSelectedDebaterIndex, 1);
          this.ironsFormArray.removeAt(uniqueSelectedDebaterIndex);
        }

        this.subscribeToIronValueChanges();

        this.spSubscriptions.forEach((subscription) => subscription.unsubscribe());
        this.spSubscriptions = this.spsFormArray.controls.map((control) =>
          control.valueChanges.subscribe(() => {
            this.setCallHouses();
          })
        )

        this.setCallHouses();
        this.checkIronsCheckboxDisable();
        this.checkDebatersCheckboxDisable();
      })
    );

    this.judgesFormGroup.valueChanges.subscribe(() => {
      const filter = this.judgesFormGroup.controls['filter'].value;

      this.selectedJudges = [];

      if (this.judgesFormGroup.controls['chair'].value)
        this.selectedJudges.push(this.getJudgeById(this.judgesFormGroup.controls['chair'].value));

      this.wingsFormArray.controls.forEach((control) => {
        if (control.value) this.selectedJudges.push(this.getJudgeById(control.value))
      });

      this.filterJudgeOptions(filter);
    });
  }

  public subscribeToIronValueChanges() {
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

        this.setCallHouses();
        this.checkIronsCheckboxDisable();
        this.checkDebatersCheckboxDisable();
      })
    );
  }

  public setCallHouses() {
    this.callHouses =
      this.selectedDebaters.length ?
      Object.entries(DebateHouse).slice() :
      [];

    if (this.selectedDebaters.length > 0 && this.selectedDebaters.length <= 1)
      this.callHouses.splice(-3);
    else if (this.selectedDebaters.length >= 2 && this.selectedDebaters.length <= 4)
      this.callHouses.splice(-2);
    else if (this.selectedDebaters.length === 5)
      this.callHouses.splice(-1);

      const sps: number[] = this.spsFormArray.controls.map((control) =>
      Number(control.value)
    );

    let houseSps = Object.entries(DebateHouse).slice().map((entry) => ({
      entry,
      sp: 0
    }));

    sps.forEach((sp, i) => {
      if (i === 0 || i === 2) houseSps[0].sp += sp;
      if (i === 1 || i === 3) houseSps[1].sp += sp;
      if (i === 4 || i === 6) houseSps[2].sp += sp;
      if (i === 5 || i === 7) houseSps[3].sp += sp;
    });

    houseSps = houseSps.sort((a, b) => b.sp - a.sp).slice(0, this.callHouses.length);

    this.callHouses = houseSps.map((houseSp) => houseSp.entry);
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
      this.filteredDebaters = this.filteredDebaters.filter((debater: Member) => removeAccents(debater.name.toLowerCase()).includes(removeAccents(filter.toLowerCase())))
    }

    if (this.debatersFilterFormGroup.controls['society'].value) {
      const filter = this.debatersFilterFormGroup.controls['society'].value;
      this.filteredDebaters = this.filteredDebaters.filter((debater: Member) => debater.society === filter)
    }

    if (this.debatersFilterFormGroup.controls['isTrainee'].value) {
      const filter = this.debatersFilterFormGroup.controls['isTrainee'].value;
      this.filteredDebaters = this.filteredDebaters.filter((debater: Member) => debater.isTrainee === filter)
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

  public dropDebater(event: CdkDragDrop<Member[]>) {
    moveItemInArray(this.selectedDebaters, event.previousIndex, event.currentIndex);

    const spsFormArray = this.spsFormArray.value;
    moveItemInArray(spsFormArray, event.previousIndex, event.currentIndex);
    this.spsFormArray.patchValue(spsFormArray);
  }

  public dropHouse(event: CdkDragDrop<DebateHouse[]>) {
    moveItemInArray(this.callHouses, event.previousIndex, event.currentIndex);
  }

  public getDebatePositionByIndex(index: number) {
    switch(index) {
      case 0:
        return DebatePosition.pm;
      case 1:
        return DebatePosition.lo;
      case 2:
        return DebatePosition.dpm;
      case 3:
        return DebatePosition.dlo;
      case 4:
        return DebatePosition.mg;
      case 5:
        return DebatePosition.mo;
      case 6:
        return DebatePosition.gw;
      case 7:
        return DebatePosition.ow;
    }

    return '';
  }

  public getDebaterBackgroundColor(index: number) {
    switch (index) {
      case 0:
      case 2:
        return 'og';
      case 1:
      case 3:
        return 'oo';
      case 4:
      case 6:
        return 'cg';
      case 5:
      case 7:
        return 'co';
    }

    return '';
  }

  public getHouseBackgroundColor(house: DebateHouse) {
    switch(house) {
      case DebateHouse.og:
        return 'og';
      case DebateHouse.oo:
        return 'oo';
      case DebateHouse.cg:
        return 'cg';
      case DebateHouse.co:
        return 'co';
    }
  }

  public debatersLegendMouseEnter(index: number, house: [key: string, value: DebateHouse]) {
    this.debatersLegendHousesRefs.toArray().forEach((ref, i) => {
      if (index === i) {
        ref.nativeElement.classList.add('form__stepper__step__debaters__houses__legend--focus');
      } else {
        ref.nativeElement.classList.add('form__stepper__step__debaters__houses__legend--blur');
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
          'form__stepper__step__debaters__positions__debater--focus'
        );
      else
        ref.nativeElement.classList.add(
          'form__stepper__step__debaters__positions__debater--blur'
        );
    });

    this.housesRefs.forEach((ref) => {
      if (ref.nativeElement.id === house[0])
        ref.nativeElement.classList.add(
          'form__stepper__step__debaters__call__house--focus'
        );
      else
        ref.nativeElement.classList.add(
          'form__stepper__step__debaters__call__house--blur'
        );
    });
  }

  public debatersLegendMouseLeave(index: number, house: [key: string, value: DebateHouse]) {
    this.debatersLegendHousesRefs.toArray().forEach((ref, i) => {
      if (index === i) {
        ref.nativeElement.classList.remove('form__stepper__step__debaters__houses__legend--focus');
      } else {
        ref.nativeElement.classList.remove('form__stepper__step__debaters__houses__legend--blur');
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
          'form__stepper__step__debaters__positions__debater--focus'
        );
      else
        ref.nativeElement.classList.remove(
          'form__stepper__step__debaters__positions__debater--blur'
        );
    });

    this.housesRefs.forEach((ref) => {
      if (ref.nativeElement.id === house[0])
        ref.nativeElement.classList.remove(
          'form__stepper__step__debaters__call__house--focus'
        );
      else
        ref.nativeElement.classList.remove(
          'form__stepper__step__debaters__call__house--blur'
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

  public getDebaterById(debaterId: string) {
    return this.debaters.find((debater) => debater.id === debaterId)!;
  }

  public async onSubmit() {
    const date: string = new Date(this.debateFormGroup.controls['date'].value).toISOString();
    const time: string = this.debateFormGroup.controls['time'].value;
    const style: keyof typeof DebateStyle = this.debateFormGroup.controls['style'].value;
    const venue: keyof typeof DebateVenue = this.debateFormGroup.controls['venue'].value;
    const motionType: string =
      this.showNewMotionTypeFormField() ?
      this.debateFormGroup.controls['newMotionType'].value :
      this.debateFormGroup.controls['motionType'].value;
    const motionTheme: string =
      this.showNewMotionThemeFormField() ?
      this.debateFormGroup.controls['newMotionTheme'].value :
      this.debateFormGroup.controls['motionTheme'].value;
    const motion: string = this.debateFormGroup.controls['motion'].value;
    const infoSlides: string[] = this.infoSlidesFormArray.controls.map((control) => control.value);
    const tournament: string =
      this.showNewTournamentFormField() ?
      this.debateFormGroup.controls['newTournament'].value :
      this.debateFormGroup.controls['tournament'].value;

    const debaters: Member[] = this.selectedDebaters;
    const sps: number[] = this.spsFormArray.controls.map((control) =>
      Number(control.value)
    );

    const points = [];
    if (this.callHouses.findIndex((house) => house[1] === DebateHouse.og) !== -1)
      points.push(3 - this.callHouses.findIndex((house) => house[1] === DebateHouse.og));
    if (this.callHouses.findIndex((house) => house[1] === DebateHouse.oo) !== -1)
      points.push(3 - this.callHouses.findIndex((house) => house[1] === DebateHouse.oo));
    if (this.callHouses.findIndex((house) => house[1] === DebateHouse.cg) !== -1)
      points.push(3 - this.callHouses.findIndex((house) => house[1] === DebateHouse.cg));
    if (this.callHouses.findIndex((house) => house[1] === DebateHouse.co) !== -1)
      points.push(3 - this.callHouses.findIndex((house) => house[1] === DebateHouse.co));

    const chair: Member = this.getJudgeById(this.judgesFormGroup.controls['chair'].value);
    const wings: Member[] = this.wingsFormArray.controls.map((control) => this.getJudgeById(control.value));

    if (this.isEditing) await this.debateService.updateDebate(
      this.debate.id,
      date,
      time,
      style,
      venue,
      motionType,
      motionTheme,
      motion,
      infoSlides,
      debaters,
      sps,
      points,
      chair,
      wings,
      tournament
    );
    else await this.debateService.createDebate(
      date,
      time,
      style,
      venue,
      motionType,
      motionTheme,
      motion,
      infoSlides,
      debaters,
      sps,
      points,
      chair,
      wings
    );

    const state = getState();

    if (!this.isEditing) {
      delete state['debate'];
    }

    setState(state);

    this.dialog.closeAll();
  }

  public checkIsEditing() {
    const state = getState();

    if (this.isEditing) {
      this.debateFormGroup.controls['date'].patchValue(this.debate.date);
      this.debateFormGroup.controls['time'].patchValue(this.debate.time);
      this.debateFormGroup.controls['style'].patchValue(this.debate.style);
      this.debateFormGroup.controls['venue'].patchValue(this.debate.venue);
      this.debateFormGroup.controls['motionType'].patchValue(this.debate.motionType);
      this.debateFormGroup.controls['motionTheme'].patchValue(this.debate.motionTheme);
      this.debateFormGroup.controls['motion'].patchValue(this.debate.motion);
      if (this.debate.infoSlides)
        this.debate.infoSlides.forEach((infoSlide) => this.infoSlidesFormArray.push(this.formBuilder.control(infoSlide)))
      if (this.debate.debaters) {
        this.selectedDebaters = this.debate.debaters;
        this.uniqueSelectedDebaters = [... new Set(this.debate.debaters)];
        this.selectedDebaters.forEach(() => this.spsFormArray.push(
          this.formBuilder.control('', [Validators.min(50), Validators.max(100)])
        ));
        const irons = this.selectedDebaters.filter((debater, index, debaters) => debaters.indexOf(debater) !== index);
        this.uniqueSelectedDebaters.forEach(() => this.ironsFormArray.push(this.formBuilder.control(false)));
        irons.forEach((iron) => this.ironsFormArray.controls[this.uniqueSelectedDebaters.findIndex((debater) => iron.id === debater.id)].patchValue(true));
      }
      if (this.debate.sps) this.spsFormArray.controls.forEach((control, index) => control.patchValue(this.debate.sps![index]));
      this.judgesFormGroup.controls['chair'].patchValue(this.debate.chair.id);
      if (this.debate.wings) this.debate.wings.forEach((wing) => this.wingsFormArray.push(this.formBuilder.control(wing.id)));
      if (this.debate.tournament) this.debateFormGroup.controls['tournament'].patchValue(this.debate.tournament);

      this.applyFilters();
      this.setCallHouses();
      this.subscribeToIronValueChanges();
    } else if (state['debate']) {
      const debate: Debate = state['debate'];

      this.debateFormGroup.controls['date'].patchValue(debate.date);
      this.debateFormGroup.controls['time'].patchValue(debate.time);
      this.debateFormGroup.controls['style'].patchValue(debate.style);
      this.debateFormGroup.controls['venue'].patchValue(debate.venue);
      this.debateFormGroup.controls['motionType'].patchValue(debate.motionType);
      this.debateFormGroup.controls['motionTheme'].patchValue(debate.motionTheme);
      this.debateFormGroup.controls['motion'].patchValue(debate.motion);

      if (debate.infoSlides) debate.infoSlides.forEach((infoSlide: any) =>
        this.infoSlidesFormArray.push(this.formBuilder.control(infoSlide))
      );

      if (debate.debaters) {
        this.selectedDebaters = debate.debaters;
        this.uniqueSelectedDebaters = [... new Set(debate.debaters as Member[])];
        this.selectedDebaters.forEach(() => this.spsFormArray.push(
          this.formBuilder.control('', [Validators.min(50), Validators.max(100)])
        ));
        const irons = this.selectedDebaters.filter((debater, index, debaters) => debaters.indexOf(debater) !== index);
        this.uniqueSelectedDebaters.forEach(() => this.ironsFormArray.push(this.formBuilder.control(false)));
        irons.forEach((iron) => this.ironsFormArray.controls[this.uniqueSelectedDebaters.findIndex((debater) => iron.id === debater.id)].patchValue(true));
      }

      if (debate.sps) this.spsFormArray.controls.forEach((control, index) => control.patchValue(debate.sps![index]));
      if (debate.chair) this.judgesFormGroup.controls['chair'].patchValue(debate.chair.id);
      if (debate.wings) debate.wings.forEach((wing) => this.wingsFormArray.push(this.formBuilder.control(wing.id)));
      if (debate.tournament) this.debateFormGroup.controls['tournament'].patchValue(debate.tournament);

      this.applyFilters();
      this.setCallHouses();
      this.subscribeToIronValueChanges();
    }
  }

  public getButtonText(): string {
    if (this.isEditing) return 'Atualizar';

    return 'Criar';
  }

  public showNewTournamentFormField() {
    return this.debateFormGroup.controls['tournament'].value === 'Nova Ocasião';
  }

  public showNewMotionTypeFormField() {
    return this.debateFormGroup.controls['motionType'].value === 'Novo Tipo';
  }

  public showNewMotionThemeFormField() {
    return this.debateFormGroup.controls['motionTheme'].value === 'Novo Tema';
  }

  public close() {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        text: `Você <b>poderá perder</b> qualquer mudança <b>não salva</b>! Tem certeza que quer continuar?`,
        positiveCallback: () => {
          const state = getState();

          if (!this.isEditing) {
            state['debate'] = {
              date: new Date(this.debateFormGroup.controls['date'].value).toISOString(),
              time: this.debateFormGroup.controls['time'].value,
              style: this.debateFormGroup.controls['style'].value,
              venue: this.debateFormGroup.controls['venue'].value,
              motionType: this.showNewMotionTypeFormField() ?
                this.debateFormGroup.controls['newMotionType'].value :
                this.debateFormGroup.controls['motionType'].value,
              motionTheme: this.showNewMotionThemeFormField() ?
                this.debateFormGroup.controls['newMotionTheme'].value :
                this.debateFormGroup.controls['motionTheme'].value,
              motion: this.debateFormGroup.controls['motion'].value,
              infoSlides: this.infoSlidesFormArray.controls.map((control) => control.value),
              tournament: this.showNewTournamentFormField() ?
                this.debateFormGroup.controls['newTournament'].value :
                this.debateFormGroup.controls['tournament'].value,
              debaters: this.selectedDebaters,
              sps: this.spsFormArray.controls.map((control) =>
                Number(control.value)
              ),
              chair: this.getJudgeById(this.judgesFormGroup.controls['chair'].value),
              wings: this.wingsFormArray.controls.map((control) => this.getJudgeById(control.value)),
            }
          }

          setState(state);

          this.dialogRef.close();
        }
      }
    });
  }
}
