import{S as n}from"./index-CtTZxJXB.js";import"./clipPlaneFragment-DN22R22F.js";import"./logDepthDeclaration-B-9BJW7E.js";import"./logDepthFragment-D8bOqasi.js";const e="linePixelShader",r=`#include<clipPlaneFragmentDeclaration>
uniform color: vec4f;
#include<logDepthDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<logDepthFragment>
#include<clipPlaneFragment>
fragmentOutputs.color=uniforms.color;
#define CUSTOM_FRAGMENT_MAIN_END
}`;n.ShadersStoreWGSL[e]||(n.ShadersStoreWGSL[e]=r);const l={name:e,shader:r};export{l as linePixelShaderWGSL};
