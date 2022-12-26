import { Component, ComponentFactoryResolver, OnDestroy, ViewChild, ViewContainerRef } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceholderDirective } from "../shared/placeholder/placeholder.directive";
import { AuthResponseData, AuthService} from "./auth.service";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnDestroy {
  isLogin = true;
  isLoading = false;
  error: string | null = null;
  errorAlertSub = new Subscription();

  @ViewChild(PlaceholderDirective, { static: false} ) alertHost;

  authForm = new FormGroup({
    email: new FormControl("", [Validators.email, Validators.required]),
    password: new FormControl("", [Validators.required, Validators.minLength(2)])
  });

  constructor(private readonly authService: AuthService, private router: Router, private componentFactoreResolver: ComponentFactoryResolver) {}

  ngOnDestroy(): void {
    if (this.errorAlertSub) {
      this.errorAlertSub.unsubscribe();
    }
  }

  onSwitch() {
    this.isLogin = !this.isLogin;
  }

  onAlertClose() {
    this.error = null;
  }

  authSubmit() {
    if (!this.authForm.valid) {
      return;
    }

    const { email, password} = this.authForm.value;

    let authObs: Observable<AuthResponseData>;

    if (this.isLogin) {
      authObs = this.authService.login(email, password);
    } else {
      authObs = this.authService.singup(email, password);
    }



    this.isLoading = true;

    authObs
      .subscribe(
        authReturn => {
          this.router.navigate(["/recipes"])
        },
        errorMessage => {
          this.isLoading = false;
          this.authForm.reset();
          this.error = errorMessage;
          this.showErrorAlert(errorMessage)
        }
      );
  }

  private showErrorAlert(errorMessage: string) {
    // const alertCmp = new AlertComponent();
    const alertCmpFactory = this.componentFactoreResolver.resolveComponentFactory(AlertComponent);
    const hostViewContainerRef: ViewContainerRef = this.alertHost.viewContainerRef;

    hostViewContainerRef.clear();
    const alertComponent = hostViewContainerRef.createComponent(alertCmpFactory);

    alertComponent.instance.message = errorMessage;
    this.errorAlertSub = alertComponent.instance.close.subscribe(() => {
      this.errorAlertSub.unsubscribe();
      hostViewContainerRef.clear();
    });
  }
}
