
export interface Employee {
    id: string
    userId: string
    departmentId: string
    workEmail: string
    firstName: string
    lastName: string
}

export interface LeaveType {
    id: string
    kind: string,
    name: string
}

export interface Department {
    id: string
    parentId: string
    name: string
}


export interface Leave {
    id: string
    status: string
    duration: string
    morning: boolean
    afternoon: boolean
    workingMinutes: number
    exportedTo: any
    timezone: string
    timezoneOffset: number
    approvers: string[]
    attachments: any[]
    notificationsSent: any[]
    deleted: boolean
    description: string
    localStartDate: string
    localEndDate: string
    userId: string
    typeId: string
    companyId: string
    createdById: string
    updatedById: string
    created: string
    updated: string
    employeeId: string
    workWeekId: string
    startDate: string
    endDate: string
    policyId: string
    country: string
    workingDays: any
    days: number
    previousId: any
    consecutiveWorkingDays: number
    consecutiveDays: number
    documentVersion: number
    cancelledById: string
    __v: number
}

