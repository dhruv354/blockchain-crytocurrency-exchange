
// export const tokens = (n) => {
//     return new web3.utils.BN(
//         web3.utils.toWei(n.toString(), 'ether')
//     )
// }


// export function toFixed(x) {
//     if (Math.abs(x) < 1.0) {
//         var e = parseInt(x.toString().split('e-')[1]);
//         if (e) {
//             x *= Math.pow(10, e - 1);
//             x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
//         }
//     } else {
//         var e = parseInt(x.toString().split('+')[1]);
//         if (e > 20) {
//             e -= 20;
//             x /= Math.pow(10, e);
//             x += (new Array(e + 1)).join('0');
//         }
//     }
//     return x;
// }


export const tokens = (wei) => {
    if(wei){
        return wei/(10**18)
    }
}

export const ether = tokens

export const  ether_address = '0x0000000000000000000000000000000000000000'

export const GREEN = 'success'
export const RED = 'danger'