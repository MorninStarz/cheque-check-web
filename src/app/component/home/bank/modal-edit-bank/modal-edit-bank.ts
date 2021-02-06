export class EditBankForm {
    bank_id: string = '';
    bank_name: string = '';
    branches: Array<BranchForm> = [];
}

export class BranchForm {
    branch_id: string = '';
    branch_name: string = '';
}