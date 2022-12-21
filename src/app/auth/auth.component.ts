import { formatCurrency } from "@angular/common";
import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { AuthResponseData, AuthService} from "./auth.service";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent {
  isLogin = true;
  isLoading = false;
  error: string | null = null;

  authForm = new FormGroup({
    email: new FormControl("", [Validators.email, Validators.required]),
    password: new FormControl("", [Validators.required, Validators.minLength(2)])
  });

  constructor(private readonly authService: AuthService, private router: Router) {}

  onSwitch() {
    this.isLogin = !this.isLogin;
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
        }
      );
  }
}
