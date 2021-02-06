import { AccountData } from "../../account/account";

export class ModalAddForm {
    name: string = '';
    lastname: string = '';
    mobile: string = '';
    accounts: AccountData[] = [];
    expect_amount: string = '';
    actual_amount: string = '';
    due_date: any = '';
    constructor() {
        this.accounts.push(new AccountData());
    }
}