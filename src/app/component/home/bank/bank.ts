export class BankForm {
    bank_name: string = '';
    branch_name: string = '';
}

export class BankItem {
    no: number;
    bank_id: string;
    bank_name: string;
    create_date: string;
    update_date: string;
    is_active: boolean;
}