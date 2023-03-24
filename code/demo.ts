import { CrudReqOpts, reqPost, reqPut, RequestType } from "./crud";
import { request } from "./crud";

    // url: "/v5/design/{tableName}/{fieldName}" param: {tableName: "A", fieldName: "a"}
export function getEncodeURL (urlTemplate: string, param: string | number | { [key: string]: any }) {
    return urlTemplate.replaceAll('\\{(.*?)\\}', (_ori: string, str: string) => {
        const res =  param;

        return res + str;
    });
}


function packOperatorHandler(res: any) {
    if (res && res.errorCode) {
        // switch (res.errorCode) {
        //     case BICst.ErrorCode.PACKAGE_ABSENT:
        //         BI.Msg.toast(BI.i18nText('BI-Conf_Pack_Absent_Tip'), { level: 'warning' });
        //         break;
        //     default:
        // }

        return Promise.reject();
    }

    return Promise.resolve(res);
}

interface KeyMap<T> {
    [key: string]: T;
}



function reqGet(url: string, opts: Omit<CrudReqOpts, 'data'> = {}) {
    const { params = {}, headers = {}, responseType, source, baseUrl, requestId, moduleRouter } = opts;

    return request({
        url,
        type: RequestType.GET,
        params,
        headers,
        responseType,
        source,
        baseUrl,
        moduleRouter,
        requestId,
    });
}

export function getBasicPool() {
    return reqGet('design/report/pool/basic').then(res => {
        return res.data;
    });
}

export function getMultiPath(): Promise<any> {
    return reqGet('conf/relations/multipath');
}

export function updateMultiPath(data: Object) {
    return reqPut('conf/relations/multipath', {
        data,
    });
}

export function getPackUpdateInfo(packId: string) {
    return reqGet(`conf/update/packs/${packId}/settings`).then(res => {
        return packOperatorHandler(res);
    });
}

export function savePackUpdateSetting(data: any) {
    return reqPost(`conf/update/packs/${data.packId}/settings`, {
        data,
    }).then(res => {
        return packOperatorHandler(res);
    });
}

export function generateCubeByPackId(data: any) {
    return reqPost(`conf/update/packs/${data.packId}/trigger`, {
        data,
    }).then(res => {
        return packOperatorHandler(res);
    });
}

export function getPackCubeStatusCheck(packId: Object) {
    return reqGet(`conf/update/packs/${packId}/status`);
}

export function getPackUpdateStatus(packId: string) {
    return reqGet(getEncodeURL('conf/update/packs/{packId}/status/detail', packId));
}

export function getPackUpdateChildPath(packId: string) {
    return reqGet(getEncodeURL('conf/update/packs/{packId}/child/path', packId));
}

// ta

export function getReferBaseTableUpdateInfo(tableName: string, data: any) {
    return reqPost(getEncodeURL('conf/update/tables/{tableName}/records/base', tableName), {
        data,
    });
}


/**
 * 更新频率过高检测
 */
export function checkUpdateFrequency(data: Object) {
    return reqPost('conf/update/schedule/upper/limit', {
        data,
    });
}

/**
 * 更新抽取前端触发
 * @param data 记录访问时间的表的表名
 * @returns
 */
export function activeTables(data: Object) {
    return reqPost('conf/tables/visit/record', {
        data,
    });
}

/**
 * 公共链接更新抽取前端触发
 * @param data 记录访问时间的表的表名
 * @returns
 */
export function publicActiveTables(data: Object) {
    return reqPost('design/report/share/tables/visit/record', {
        data,
    });
}

/**
 * 重复拉起更新提醒
 */
export function checkRepeatUpdate(data: Object) {
    return reqPost('conf/update/schedule/repeat', {
        data,
    });
}