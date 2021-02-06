import { AccountData } from "../../account/account";

export class ModalEditForm {
    name: string;
    lastname: string;
    mobile: string;
    accounts: AccountData[];
    expect_amount: string;
    actual_amount: string;
    due_date: any;
}