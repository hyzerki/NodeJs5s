import crypto from "crypto";

export function ServerSign() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
    });
    let s = crypto.createSign('SHA256');
    this.getSignContext = (rs, cb) => {
        rs.pipe(s);
        rs.on('end', () => {
            cb(
                {
                    signature: s.sign(privateKey).toString('hex'),
                    publicKey: publicKey.toString('hex')
                }
            );
        });
    }
}

export function ClientVerify(SignContext) {
    const v = crypto.createVerify('SHA256');
    this.verify = (rs, cb) => {
        rs.pipe(v);
        rs.on('end', () => {
            cb(v.verify(SignContext.publicKey, SignContext.signature, 'hex'));
        });
    }
}